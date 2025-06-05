/* server/init.js
** You must write a script that will create documents in your database according
** to the datamodel you have defined for the application.  Remember that you 
** must at least initialize an admin user account whose credentials are derived
** from command-line arguments passed to this script. But, you should also add
** some communities, posts, comments, and link-flairs to fill your application
** some initial content.  You can use the initializeDB.js script from PA03 as 
** inspiration, but you cannot just copy and paste it--you script has to do more
** to handle the addition of users to the data model.
*/
//server/init.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//import Mongoose models
const User = require('./models/users');
const Community = require('./models/communities');
const Post = require('./models/posts');
const Comment = require('./models/comments');
const LinkFlair = require('./models/linkflairs');

//parse command-line arguments
let userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

//destructure after the check
const [mongoURL, adminEmail, adminDisplayName, adminPassword] = userArgs;

//validate remaining required args
if (!adminEmail || !adminDisplayName || !adminPassword) {
  console.error("Usage: node server/init.js <mongoURL> <adminEmail> <adminDisplayName> <adminPassword>");
  process.exit(1);
}

//connect to MongoDB
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

async function init() {
  //clear existing data from the database
  console.log("Clearing old data...");
  await Promise.all([
    User.deleteMany({}),
    Community.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    LinkFlair.deleteMany({})
  ]);

  //create an admin user using CLI credentials
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const adminUser = await User.create({
    email: adminEmail,
    displayName: adminDisplayName,
    passwordHash: adminHash,
    reputation: 1000,
    role: 'admin'
  });

  //create regular users
  const regularUsers = await User.insertMany([
    {
      email: 'user1@gmail.com',
      displayName: 'fantasy',
      passwordHash: await bcrypt.hash('imthe104', 10),
      reputation: 100
    },
    {
      email: 'user2@icloud.com',
      displayName: 'wonderz',
      passwordHash: await bcrypt.hash('pswrd22', 10),
      reputation: 100
    },
    {
      email: 'user3@yahoo.com',
      displayName: 'random',
      passwordHash: await bcrypt.hash('baller10', 10),
      reputation: 100
    }
  ]);

  //create a lookup object for quick access by displayName
  const userMap = Object.fromEntries(regularUsers.map(u => [u.displayName, u]));

  //create several link flairs for categorizing posts
  const flairs = await LinkFlair.insertMany([
    { content: 'Its spring' },
    { content: 'Warm weather' },
    { content: 'Finals season' },
    { content: 'Can school be over already' }
  ]);

      //create community and add the post and members to it
    const community = await Community.create({
        name: 'Community1',
        description: 'Its spring!',
        postIDs: [],
        createdBy: regularUsers[0]._id,
        members: [adminUser._id, ...regularUsers.map(u => u._id)]
      });

    adminUser.communities.push(community._id)
    await adminUser.save()
    
    regularUsers.forEach(async (user) => await User.updateOne({_id: user._id},{$push:{communities: community._id}}))

  //create post that includes nested comments and flair
  const post = await Post.create({
    title: 'Test Post Title',
    content: 'This is a seeded post.',
    postedBy: userMap['wonderz']._id, //post author
    communityId: community._id, //set after community creation
    views: 42,
    voteCount: 0,
    upvoters: [userMap['fantasy']._id],
    downvoters: [userMap['random']._id],
    linkFlairID: flairs[0]._id,
    commentIDs: [] //top-level comment thread
  });

    //create nested comment structure: A → B → C
  const commentC = await Comment.create({
    content: 'Nested reply',
    commentedBy: userMap['random']._id , //third-level comment
    commentIDs: [],
    community: community._id,
    post: post._id
  });
  regularUsers[2].comments.push(commentC);
  await regularUsers[2].save()

  const commentB = await Comment.create({
    content: 'Reply to A',
    commentedBy: userMap['fantasy']._id, //second-level comment
    commentIDs: [commentC._id], //references commentC as its child
    community: community._id,
    post: post._id
  });
  regularUsers[0].comments.push(commentB);
  await regularUsers[0].save()

  const commentA = await Comment.create({
    content: 'Top-level comment',
    commentedBy: userMap['wonderz']._id, //top-level comment
    commentIDs: [commentB._id], //references commentB as its child
    community: community._id,
    post: post._id
  });
  regularUsers[1].comments.push(commentA);
  await regularUsers[1].save()
  
  commentC.parentComment = commentB;
  await commentC.save()

  commentB.parentComment = commentA;
  await commentB.save();

  post.commentIDs.push(commentA._id);
  await post.save()

    //add post to community’s postIDs and save
    community.postIDs.push(post._id);
    await community.save();

    regularUsers[1].posts.push(post._id)
    await regularUsers[1].save()

  //final message
  console.log("Database initialized with test data.");
  mongoose.disconnect();
}

//run script
init().catch(err => {
  console.error("Initialization failed:", err);
  mongoose.disconnect();
});