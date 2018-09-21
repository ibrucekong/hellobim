document.addEventListener("DOMContentLoaded", function (event) {
  function loadFromBimserver(address, username, password, target) {
    var client = new BimServerClient(address);
    client.init(function () {
      client.login(username, password, function () {
        // 根据项目名称获取该项目的模型场景
        client.call("ServiceInterface", "getAllProjects", {
          onlyTopLevel: true,
          onlyActive: true
        }, function (projects) {
          var totalFound = 0;
          projects.forEach(function (project) {
            if (project.name === projectName) {
              token = client.token;
              poid = project.oid;
              lastRevisionId = project.lastRevisionId;
            }
          });
        });
      }, function (error) {
        console.error(error);
      });
    });
  }

  try {
    loadFromBimserver(address, account, password);
  } catch (e) {
    console.log(e);
  }
});