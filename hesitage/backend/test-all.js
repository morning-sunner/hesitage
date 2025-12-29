// backend/test-simple.js
const http = require('http');
const https = require('https');
const net = require('net');

async function testServer() {
  const serverHost = '47.110.134.147';
  const serverPort = 3000;
  
  console.log('🔍 开始测试服务器...\n');
  
  // 1. 测试网络连通性
  console.log('1. 测试TCP连接...');
  try {
    await testTcpConnection(serverHost, serverPort);
    console.log('   ✅ TCP连接成功');
  } catch (err) {
    console.log(`   ❌ TCP连接失败: ${err.message}`);
    console.log('   💡 可能原因:');
    console.log('      - 服务器未启动');
    console.log('      - 防火墙阻挡');
    console.log('      - 网络问题');
    return;
  }
  
  // 2. 测试HTTP服务
  console.log('\n2. 测试HTTP服务...');
  await testHttpEndpoint(serverHost, serverPort, '/health');
  
  console.log('\n3. 测试PDF列表API...');
  await testHttpEndpoint(serverHost, serverPort, '/api/pdf/files?limit=1');
  
  console.log('\n4. 测试PDF下载...');
  await testDownload(serverHost, serverPort, 1);
}

function testTcpConnection(host, port) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(port, host, () => {
      socket.destroy();
      resolve();
    });
    
    socket.setTimeout(5000);
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('连接超时'));
    });
    
    socket.on('error', (err) => {
      reject(err);
    });
  });
}

function testHttpEndpoint(host, port, path) {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 10000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   ✅ 响应状态: ${res.statusCode} ${res.statusMessage}`);
        console.log(`       内容类型: ${res.headers['content-type']}`);
        console.log(`       内容长度: ${res.headers['content-length'] || data.length} bytes`);
        
        try {
          const jsonData = JSON.parse(data);
          console.log(`       响应数据: ${JSON.stringify(jsonData).substring(0, 200)}...`);
        } catch (e) {
          console.log(`       响应数据: ${data.substring(0, 200)}...`);
        }
        
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ 请求失败: ${err.message}`);
      resolve();
    });
    
    req.on('timeout', () => {
      console.log('   ⏱️ 请求超时');
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

function testDownload(host, port, pdfId) {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: `/api/pdf/download/${pdfId}`,
      method: 'GET',
      timeout: 15000
    };
    
    const req = http.request(options, (res) => {
      let totalBytes = 0;
      let chunks = [];
      
      res.on('data', (chunk) => {
        totalBytes += chunk.length;
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        console.log(`   ✅ 响应状态: ${res.statusCode} ${res.statusMessage}`);
        console.log(`       内容类型: ${res.headers['content-type']}`);
        console.log(`       内容长度: ${res.headers['content-length'] || totalBytes} bytes`);
        console.log(`       Content-Disposition: ${res.headers['content-disposition']}`);
        console.log(`       实际下载: ${totalBytes} bytes`);
        
        if (totalBytes > 0) {
          console.log('   🎉 PDF下载测试成功！');
        } else {
          console.log('   ⚠️ 警告: 下载的数据为空');
        }
        
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ 下载失败: ${err.message}`);
      resolve();
    });
    
    req.on('timeout', () => {
      console.log('   ⏱️ 下载超时');
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

// 运行测试
testServer().catch(console.error);