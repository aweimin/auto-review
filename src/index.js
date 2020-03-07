const vscode = require("vscode");
const spawn = require("child_process").spawn;

/**
 * 转换成字符串
 * @param {*} data
 */
const uint8ArrayToString = data => {
  let dataString = "";
  for (var i = 0; i < data.length; i++) {
    dataString += String.fromCharCode(data[i]);
  }
  return dataString;
};

/**
 * @param {vscode.ExtensionContext} context
 */
const activate = context => {
  let disposable = vscode.commands.registerCommand("review.autoReview", uri => {
    if (uri) {
      const { fsPath: workSpacePath } = uri;
      const copsPath = vscode.workspace
        .getConfiguration()
        .get("autoReview.copsPath");
      const serverURL = vscode.workspace
        .getConfiguration()
        .get("autoReview.serverURL");
      const svnUser = vscode.workspace
        .getConfiguration()
        .get("autoReview.yourName");
      const showMessage = vscode.workspace
        .getConfiguration()
        .get("autoReview.showMessage");
      const python = `${copsPath}/Python27/python.exe`;
      const pythonPy = `${copsPath}/copsgui.py`;

      console.log("workSpacePath " + workSpacePath);
      console.log("copsPath " + copsPath);
      console.log("serverURL " + serverURL);
      console.log("svnUser " + svnUser);

      const workerProcess = spawn(python, [
        pythonPy,
        copsPath,
        workSpacePath,
        serverURL,
        svnUser,
        1
      ]);

      workerProcess.stdout.on("data", function(data) {
        console.log("************** stdout **************");
        const message = data ? data.toString() : "";
        console.log(message);
        if (showMessage) {
          vscode.window.showInformationMessage(message);
        }
      });

      workerProcess.stderr.on("data", function(data) {
        console.log("************** stderr **************");
        const message = data ? data.toString() : "";
        console.log(message);
        if (showMessage) {
          vscode.window.showErrorMessage(message);
        }
      });

      workerProcess.on("close", function(code) {
        console.log("子进程已退出，退出码 " + code);
      });
    }
  });

  context.subscriptions.push(disposable);
};
exports.activate = activate;

const deactivate = () => {};

module.exports = {
  activate,
  deactivate,
  uint8ArrayToString
};
