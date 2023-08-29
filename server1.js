const http = require('http');
const fs = require("fs");
const qs = require("querystring");

const port = 3000;
const ip = "127.0.0.1";

//導向指定網頁
const sendResponse = (filename, statusCode, response) => {
  //獲取檔案
  fs.readFile(`./html/${filename}`, (error, data) => {
    if (error) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "text/plain");
      response.end("Sorry, internal error");
    } else {
      response.statusCode = statusCode;
      response.setHeader("Content-Type", "text/html");
      response.end(data);
    }
  });
};

// 建立伺服器
const server = http.createServer((request, response) => {
  console.log(request.url, request.method);
  const method = request.method;
  let url = request.url;

  if (method === "GET") {
    const requestUrl = new URL(url, `http://${ip}:${port}`);
    url = requestUrl.pathname;
    const lang = requestUrl.searchParams.get("lang");
    let selector;

    //切換語言
    if (lang === null || lang === "en") {
      selector = "";
    } else if (lang === "zh") {
      selector = "-zh";
    } else {
      selector = "";
    }

    //切換網頁
    if (url === "/") {
      sendResponse(`index${selector}.html`, 200, response);
    } else if (url === "/about.html") {
      sendResponse(`about${selector}.html`, 200, response);
    } else if (url === "/login.html") {
      sendResponse(`login${selector}.html`, 200, response);
    } else if (url === "/login-success.html") {
      sendResponse(`login-success${selector}.html`, 200, response);
    } else if (url === "/login-fail.html") {
      sendResponse(`login-fail${selector}.html`, 200, response);
    } else {
      sendResponse(`404${selector}.html`, 404, response);
    }

  } else {
    if (url === "/process-login") {
      let body = [];
      
      //監聽器
      request.on("data", (chunk) => {
        body.push(chunk);
      });

      //監聽器
      request.on("end", () => {
        body = Buffer.concat(body).toString();
        body = qs.parse(body);
        console.log(body);

        //驗證密碼
        if (body.username === "john" && body.password === "john123") {
          response.statusCode = 301;
          response.setHeader("Location", "/login-success.html");
        } else {
          response.statusCode = 301;
          response.setHeader("Location", "/login-fail.html");
        }

        response.end();
      });

    }
  }
});

//監聽指定PORT
server.listen(port, ip, () => {
  console.log(`Server is running at http://${ip}:${port}`);
});