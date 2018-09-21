
require(["bimsurfer/src/BimSurfer",
    "bimsurfer/src/BimServerModelLoader",
    "bimsurfer/src/StaticTreeRenderer",
    "bimsurfer/src/MetaDataRenderer",
    "bimsurfer/lib/domReady!"],
  function (BimSurfer, BimServerModelLoader, StaticTreeRenderer, MetaDataRenderer) {

    function processBimSurferModel(bimSurferModel) {

      bimSurferModel.getTree().then(function (tree) {

        var domtree = new StaticTreeRenderer({
          domNode: 'treeContainer'
        });
        domtree.addModel({name: "", id: lastRevisionId, tree: tree});
        domtree.build();
        metadata = new MetaDataRenderer({
          domNode: 'dataContainer'
        });

        metadata.addModel({name: "", id: lastRevisionId, model: bimSurferModel});

        bimSurfer.on("selection-changed", function (selected) {
          domtree.setSelected(selected, domtree.SELECT_EXCLUSIVE);
          metadata.setSelected(selected);
        });

        domtree.on("click", function (oid, selected) {
          if (selected.length) {
            bimSurfer.viewFit({
              ids: selected,
              animate: true
            });
          }
          bimSurfer.setSelection({
            ids: selected,
            clear: true,
            selected: true
          });
        });

      });
    }

    var bimSurfer = new BimSurfer({
      domNode: "viewerContainer"
    });
    window.bimSurfer = bimSurfer;

    var bimServerClient = new BimServerClient(address, null);
    bimServerClient.init(function () {

      bimServerClient.setToken(token, function () {
        var modelLoader = new BimServerModelLoader(bimServerClient, bimSurfer);

        var models = {}; // roid -> Model

        var nrProjects;

        function loadModels(models, totalBounds) {
          var center = [
            (totalBounds.min[0] + totalBounds.max[0]) / 2,
            (totalBounds.min[1] + totalBounds.max[1]) / 2,
            (totalBounds.min[2] + totalBounds.max[2]) / 2
          ];

          var globalTransformationMatrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -center[0], -center[1], -center[2], 1
          ];
          for (var roid in models) {
            var model = models[roid];
            modelLoader.setGlobalTransformationMatrix(globalTransformationMatrix);
            modelLoader.loadFullModel(model).then(function (bimSurferModel) {
              processBimSurferModel(bimSurferModel);
              //填充下拉框
              getModelOidAndName(bimSurferModel);
            });
          }
        }

        function getModelOidAndName(thisModel) {
          var modelObj = thisModel.apiModel.objects;
          Object.keys(modelObj).forEach(function (key) {
            if (modelObj[key].object.hasChildren === undefined) {
              var option = document.createElement("option");
              $(option).val(key);
              if (modelObj[key].object.Name === undefined || modelObj[key].object.Name === "") {
                $(option).text(key);
              } else {
                $(option).text(modelObj[key].object.Name);
              }
              $('#select').append(option);
            }
          });
        }

        bimServerClient.call("ServiceInterface", "getAllRelatedProjects", {poid: poid}, function (projects) {
          nrProjects = projects.length;
          var totalBounds = {
            min: [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
            max: [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE]
          };

          projects.forEach(function (project) {

            if (project.lastRevisionId !== -1) {
              //lastRevisionId
              bimServerClient.getModel(project.oid, project.lastRevisionId, project.schema, false, function (model) {
                models[project.lastRevisionId] = model;

                bimServerClient.call("ServiceInterface", "getModelMinBounds", {roid: project.lastRevisionId}, function (minBounds) {
                  bimServerClient.call("ServiceInterface", "getModelMaxBounds", {roid: project.lastRevisionId}, function (maxBounds) {
                    if (minBounds.x < totalBounds.min[0]) {
                      totalBounds.min[0] = minBounds.x;
                    }
                    if (minBounds.y < totalBounds.min[1]) {
                      totalBounds.min[1] = minBounds.y;
                    }
                    if (minBounds.z < totalBounds.min[2]) {
                      totalBounds.min[2] = minBounds.z;
                    }
                    if (maxBounds.x > totalBounds.max[0]) {
                      totalBounds.max[0] = maxBounds.x;
                    }
                    if (maxBounds.y > totalBounds.max[1]) {
                      totalBounds.max[1] = maxBounds.y;
                    }
                    if (maxBounds.z > totalBounds.max[2]) {
                      totalBounds.max[2] = maxBounds.z;
                    }
                    nrProjects--;
                    if (nrProjects === 0) {
                      loadModels(models, totalBounds);
                    }
                  });
                });
              });
            } else {
              nrProjects--;
              if (nrProjects === 0) {
                loadModels(models, totalBounds);
              }
            }
          });
        });
      });
    });
  });