Ok, I need you to hook these 2 UIs into this API dynamically.

To run this locally, use SAM
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

Then you can hit these API endpoints:
http://127.0.0.1:3000/api/all
http://127.0.0.1:3000/api/client?name=Example Corp


The UI I want displayed is compiled in this node dashboard (one level higher).

`node run start`

When you get it working locally, you can try hitting live data:
https://4apz632vpan4f5u2unyg75kury0jvrzm.lambda-url.us-east-1.on.aws/?json=1

https://4apz632vpan4f5u2unyg75kury0jvrzm.lambda-url.us-east-1.on.aws/client?name=Example%20Corp&json=1


The goal is to code all aspects of what is had here and update the charts and tables based on the data.