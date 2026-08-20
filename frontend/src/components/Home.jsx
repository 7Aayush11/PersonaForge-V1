import { useState } from "react";
import ToastStack from "./Toast";
import Footer from "./Footer";
import Loader from "./Loader";
import Landing from "./Landing";
import Header from "./Header";
import Editor from "./Editor";


export default function Home(){
  const[files, setFiles] = useState(null);
  const[loading, setLoading] = useState(false);
  const[toasts, setToasts] = useState([]);

  const api = process.env.REACT_APP_API_URL;

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, {id, duration: 6000, ...toast}]);
    return id;
  }

  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !==id));

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const formData = new FormData();
    formData.append("file", file)

    setLoading(true);
    try{
      const res = await fetch(`${api}/generate`, {method: "POST", body: formData})

      if (!res.ok){
        const err = await res.json().catch(()=>({}))
        addToast({
          type: "error",
          title: "Generation faile",
          message: err.detail || "Something went wrong reading that file"
        })
        return
      }

      const data = await res.json();
      setFiles(data.files);
      console.log("FILES KEYS:", Object.keys(data.files));
      console.log("APP.JSX CONTENT:", data.files["src/App.jsx"]);
    }
    catch(error){
      addToast({
        type: "error",
        title: "Generation failed",
        message: error.message
      })
    }
    finally{
      setLoading(false);
    }
  };

  const handleReset =()=> setFiles(null)

  return(
    <div style={{display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header showReset={!!files} onReset={handleReset}/>

      <div style={{flex: 1, display:"flex", minHeight:0}}>
        {loading ?(
          <div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <Loader/>
          </div>) : !files ? (
            <Landing handleUpload={handleUpload}/>
          ):(
            <Editor files={files}/>
          )
        }
      </div>
      {!files && <Footer/>}
      <ToastStack toasts={toasts} onDismiss={dismissToast}/>
    </div>
  )
}