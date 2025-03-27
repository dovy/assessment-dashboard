## Running locally to test

### Install Packages
Go into the ~/modules/centralized/lambda/portal/src folder and run:
```
npm install
npm run build
```

If you want to develop the GUI in real time you can run:
```
npm run start
```

### Run SAM locally
With Docker you can run an instance of the API locally for testing.
```
sam local start-api
```

## Deploying to lambda

### Install Packages
Go into the ~/modules/centralized/lambda/portal/src folder and run:
```
npm install
npm run build
```

### Deploy
```
cd ~/centralize
terragrunt run-all apply --terragrunt-working-dir ./
```

