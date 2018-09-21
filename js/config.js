var projectName = 'test1'; // address地址下的BIMserver服务中必须有test1项目，而且还要有模型
var address = "http://192.168.1.116:8082"; // 这三个是在安装BIMserver时配置的地址、账户和密码
var account = "admin@163.com";
var password = "1234567890";
var token, poid, lastRevisionId; // 这三个是在模型加载时需要用到的
var metadata; // 这是右侧元数据