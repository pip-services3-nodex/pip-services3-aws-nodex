# <img src="https://uploads-ssl.webflow.com/5ea5d3315186cf5ec60c3ee4/5edf1c94ce4c859f2b188094_logo.svg" alt="Pip.Services Logo" width="200"> <br/> AWS specific components for Node.js Changelog / ES2017

## <a name="1.1.6"></a> 1.1.6 (2021-09-03)

### Bug Fixes
* Fixed LambdaClient invoke function

## <a name="1.1.1-1.1.5"></a> 1.1.1-1.1.5 (2021-09-02)

### Bug Fixes
* Fixed base name adding to the command in CommandableLambda
* Added reference to aws-sdk
* Added aws as a formal dependency
* Fix LambdaService act function, add  cmd duplication check

## <a name="1.1.0"></a> 1.1.0 (2021-06-11)

### Features
* **services** LambdaService, CommandableLambdaService
* **containers** Modified LambdaFunction to delegate actions to LambdaService(s)