import { useState } from 'react'
import './App.css'
import AWS from 'aws-sdk'
function App() {
  const [file, setFile] = useState([]);
  const [fileStatus, setFileStatus] = useState([])
  let cpyArr = [];
  const uploadFile = async () => {
    console.log("uploading");
    console.log(import.meta.env)
    const env = import.meta.env

    const REGION = env.VITE_BUCKET_REGION;
    const BUCKET_NAME = env.VITE_S3_BUCKET_NAME;
    const SECRET_KEY = env.VITE_AWS_SECRET_KEY;
    const ACCESS_KEY = env.VITE_AWS_ACCESS_KEY_ID;

    AWS.config.update({
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
      region: REGION
    });

    const s3 = new AWS.S3({
      params: { Bucket:  BUCKET_NAME },
      region: REGION,
    });

    file.forEach(async (element) => {
      const params = {
        Bucket: BUCKET_NAME,
        Key: element.name,
        Body: element,
      };

      var upload = s3
        .putObject(params)
        .on("httpUploadProgress", (evt) => {
          const myFile = {
            "fileName": element.name,
            "progress": parseInt((evt.loaded * 100) / evt.total)
          }
          changeState(myFile);
        })

        .promise();

      await upload.then((data, err) => {
        console.log(data);
        console.log(err);
        if(!err){
          alert("File uploaded successfully.");
        }
      });
    });

  };
  const handleChange = (e) => {
    setFile([...e.target.files])
  }
  const changeState = (myFile) => {

    const currentFile = cpyArr.findIndex(f => f.fileName == myFile.fileName);
    if (currentFile >= 0) {
      cpyArr = [...fileStatus];
      cpyArr[currentFile].progress = myFile.progress;
    } else {
      cpyArr.push(myFile);
    }
    setFileStatus([...cpyArr])
  }
  return (
    <>
      upload file : <input type="file" multiple name="file-ele" onChange={(e) => { handleChange(e) }} id="fileUpload" /><br></br>
      <button onClick={uploadFile}>Upload</button>
      <div>
        {fileStatus.map((obj) => <div key={obj.fileName}>{obj.fileName} was uploaded : {obj.progress}% <progress max={100} value={obj.progress}/></div>)}
      </div>
    </>
  )
}

export default App
