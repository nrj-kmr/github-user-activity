const https = require('https');

const username = process.argv[2];
if (!username) {
     console.error('Please provide a username');
     process.exit(1);
}

(function fetchGitHubActivity(username) {
     const options = {
          hostname: 'api.github.com',
          path: `/users/${username}/events`,
          method: 'GET',
          headers: { 'User-Agent': 'node.js' } // GitHub requires a User-Agent header
     };

     https.get(options, (res) => {
          let data = '';

          // Handle incoming data chunks
          res.on('data', (chunk) => {
               data += chunk;
          });

          // On end of the response
          res.on('end', () => {
               if (res.statusCode === 200) {
                    const events = JSON.parse(data);
                    displayActivity(events);
               } else {
                    console.log(`Error: ${res.statusCode} - ${res.statusMessage}`);
               }
          });
     }).on('error', (err) => {
          console.error('Error fetching data:', err);
     });


     https.get(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });

          res.on('end', () => {
               if (res.statusCode === 200) {
                    const events = JSON.parse(data);
                    if (events.length === 0) {
                         console.log('No recent activity found.');
                    } else {
                         displayActivity(events);
                    }
               } else if (res.statusCode === 404) {
                    console.log('User not found.');
               } else {
                    console.log(`Error: ${res.statusCode} - ${res.statusMessage}`);
               }
          });
     }).on('error', (err) => {
          console.error('Error:', err.message);
     });
})(username);


function displayActivity(events) {
     console.log(`Recent activity for ${username}:`);
     events.forEach(event => {
          switch (event.type) {
               case 'PushEvent':
                    console.log(`- Push to the ${event.payload.ref} branch at ${event.repo.name}`);
                    break;
               case 'IssueCommentEvent':
                    console.log(`- Commented on issue ${event.payload.issue.number} on ${event.repo.name}`);
                    break;
               case 'ForkEvent':
                    console.log(`- Forked ${event.repo.name}`);
                    break;
               case 'CreateEvent':
                    console.log(`- Created ${event.payload.ref_type} ${event.payload.ref} at ${event.repo.name}`);
                    break;
               case 'DeleteEvent':
                    console.log(`- Deleted ${event.payload.ref_type} ${event.payload.ref} at ${event.repo.name}`);
                    break;
               case 'PullRequestEvent':
                    console.log(`- ${event.payload.action} pull request #${event.payload.number} at ${event.repo.name}`);
                    break;
               case 'StarEvent':
                    console.log(`- Starred ⭐️ ${event.repo.name}`);
                    break;
               default:
                    console.log(`- ${event.type} at ${event.repo.name}`);
                    break;
          }
     });
}