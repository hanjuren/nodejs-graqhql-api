import { ApolloServer, gql } from "apollo-server";

// dummy data
let tweets = [
  {
    id: 1,
    text: "hello",
    userId: 1,
  },
  {
    id: 2,
    text: "hi",
    userId: 1,
  },
  {
    id: 3,
    text: "hello graphql",
    userId: 2,
  },
];

let users = [
  {
    id: 1,
    firstName: "Kim",
    lastName: "Min Soo",
  },
  {
    id: 2,
    firstName: "Kim",
    lastName: "Jin Soo",
  }
];

// SDL schema definition language
const typeDefs = gql`
  type User {
    id: ID!
    firstName: String
    lastName: String
    """Is the sum of firstName + lastName as a String"""
    fullName: String!
  }
  
  """Tweet Objects represents a resource for a Tweet"""
  type Tweet {
    id: ID!
    text: String!
    author: User
  }

  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }
  
  # Query => GET  
  type Query { # Query 는 필수로 작성해주어야 함
    # 객체의 형식 지정
    # !는  Non-Null Fields
    
    # User
    allUsers: [User!]!
    
    # Tweet
    allTweets: [Tweet]!
    tweet(id: ID!): Tweet
    
    # Movie
    allMovies: [Movie!]!
    movie(id: ID!): Movie
  }
  
  # Mutation => POST
  type Mutation { # 데이터베이스의 변경사항이 있는 작업
    postTweet(text: String!, userId: ID): Tweet!
    
    """Deletes a Tweet if found, else returns false"""
    deleteTweet(id: ID!): Boolean!
  }
`;

// 요청에 대한 작업 정의
const resolvers = {
  Query: {
    // Query allUsers 의 작업
    allUsers() {
      return users;
    },

    allTweets() {
      return tweets;
    },

    tweet(root, { id }) {
      return tweets.find((tweet) => tweet.id === Number(id));
    },

    allMovies() {
      return fetch("https://yts.mx/api/v2/list_movies.json")
        .then((res) => res.json())
        .then((res) => {
          return res.data['movies'];
        })
        .catch((err) => {
          console.log(err.message);
        })
    },

    movie(_, { id }) {
      return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
        .then((res) => res.json())
        .then((res) => {
          return res.data['movie'];
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  },

  Mutation: {
    postTweet(_, { text, userId }) {
      const user = users.find(user => user.id === Number(userId));
      console.log(user)
      if (!user) { throw new Error(`Not Found Error`); }

      const tweet = {
        id: tweets.length + 1,
        text,
        userId: user.id,
      };
      tweets.push(tweet);
      return tweet;
    },

    deleteTweet(_, { id }) {
      const tweet = tweets.find((tweet) => tweet.id === Number(id));
      if (!tweet) {
        return false;
      }
      tweets = tweets.filter(tweet => tweet.id !== Number(id));
      return true;
    }
  },

  User: {
    fullName({ firstName, lastName }) {
      return `${firstName} ${lastName}`;
    }
  },

  Tweet: {
    author({ userId }) {
      return users.find(user => user.id === userId);
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});