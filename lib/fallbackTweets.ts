// Fallback tweets data to use when Twitter API is unavailable or rate limited

export const FALLBACK_TWEETS = [
  {
    "id": "fallback_1",
    "username": "cryptodev_alex",
    "displayName": "Alex Chen",
    "avatar": "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    "content": "Just completed my first #xquests challenge! 🚀 Explaining DeFi to my non-crypto friends was harder than I thought, but the 25 ALGO reward made it worth it! #crypto #education #algorand",
    "timestamp": "2m",
    "likes": 24,
    "retweets": 8,
    "replies": 3,
    "verified": false,
    "challengeTag": "DeFi Education",
    "followerCount": 1250
  },
  {
    "id": "fallback_2",
    "username": "web3_sarah",
    "displayName": "Sarah Martinez",
    "avatar": "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    "content": "The future of AI is here and it's incredible! 🤖 Working on my #xquests submission about AI in healthcare. The potential to save lives is mind-blowing! Who else is participating? #AI #innovation",
    "timestamp": "5m",
    "likes": 67,
    "retweets": 23,
    "replies": 12,
    "verified": true,
    "challengeTag": "AI Innovation",
    "followerCount": 5420
  },
  {
    "id": "fallback_3",
    "username": "blockchain_bob",
    "displayName": "Bob Thompson",
    "avatar": "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    "content": "Building communities in web3 isn't just about tech - it's about people! 🌐❤️ My #xquests challenge focuses on human connection in digital spaces. What's your take? #web3 #community",
    "timestamp": "8m",
    "likes": 45,
    "retweets": 15,
    "replies": 7,
    "verified": false,
    "challengeTag": "Community Building",
    "followerCount": 890
  },
  {
    "id": "fallback_4",
    "username": "algo_enthusiast",
    "displayName": "Maria Rodriguez",
    "avatar": "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    "content": "Algorand's carbon-negative blockchain is the future! 🌱 Just earned 35 ALGO from my #xquests sustainability challenge. Green crypto FTW! Who's joining the movement? #algorand #sustainability",
    "timestamp": "12m",
    "likes": 89,
    "retweets": 34,
    "replies": 18,
    "verified": true,
    "challengeTag": "Sustainability",
    "followerCount": 3200
  },
  {
    "id": "fallback_5",
    "username": "nft_creator_jane",
    "displayName": "Jane Wilson",
    "avatar": "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    "content": "NFTs beyond art: digital identity, certificates, memberships... the possibilities are endless! 🎨➡️🌍 My #xquests submission explores real-world utility. What use cases excite you most?",
    "timestamp": "15m",
    "likes": 52,
    "retweets": 19,
    "replies": 9,
    "verified": false,
    "challengeTag": "NFT Innovation",
    "followerCount": 2100
  }
];

export const ADDITIONAL_FALLBACK_TWEETS = [
  {
    "id": "fallback_6",
    "username": "defi_wizard",
    "displayName": "David Kim",
    "avatar": "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    "content": "Yield farming strategies that actually make sense! 📚💰 Breaking down complex DeFi concepts for my #xquests challenge. Education is key to adoption. What would you like to learn about?",
    "timestamp": "18m",
    "likes": 73,
    "retweets": 28,
    "replies": 14,
    "verified": true,
    "challengeTag": "DeFi Education",
    "followerCount": 4800
  },
  {
    "id": "fallback_7",
    "username": "crypto_newbie",
    "displayName": "Emma Johnson",
    "avatar": "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    "content": "Learning about smart contracts through #xquests has been amazing! 💪 The community here is so supportive. Already earned my first 15 ALGO! #blockchain #learning #smartcontracts",
    "timestamp": "22m",
    "likes": 31,
    "retweets": 12,
    "replies": 5,
    "verified": false,
    "challengeTag": "Education",
    "followerCount": 450
  },
  {
    "id": "fallback_8",
    "username": "algo_trader",
    "displayName": "Michael Chen",
    "avatar": "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    "content": "Passive income through DeFi staking explained! 📈 My #xquests challenge breaks down the risks and rewards. DYOR but here's what I've learned... #defi #algorand #staking",
    "timestamp": "25m",
    "likes": 58,
    "retweets": 21,
    "replies": 8,
    "verified": true,
    "challengeTag": "DeFi Education",
    "followerCount": 6700
  },
  {
    "id": "fallback_9",
    "username": "web3_builder",
    "displayName": "Lisa Park",
    "avatar": "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
    "content": "Building the future one dApp at a time! 🔗 My #xquests submission showcases how blockchain can revolutionize supply chains. The transparency is game-changing! #innovation #blockchain",
    "timestamp": "28m",
    "likes": 42,
    "retweets": 16,
    "replies": 6,
    "verified": false,
    "challengeTag": "Innovation",
    "followerCount": 1800
  }
];

// Demo tweets (same as fallback for now, but could be different)
export const DEMO_TWEETS = [...FALLBACK_TWEETS, ...ADDITIONAL_FALLBACK_TWEETS];
