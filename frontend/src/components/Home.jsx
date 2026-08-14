import { useState } from "react";
import Loader from "./Loader";
import FilePreview from "./FilePreview";
import Upload from "./Upload";

export default function Home(){

    const [html, setHtml] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [chat, setChat] = useState([])
    const [slug, setSlug] = useState("")
    const [deployedUrl, setDeployedUrl] = useState("")
    const [deployError, setDeployError] = useState("")
    const [deploying, setDeploying] = useState(false)
    const [deleteToken, setDeleteToken] = useState("")
    const [manageSlug, setManageSlug] = useState("")
    const [manageToken, setManageToken] = useState("")
    const [manageMessage, setManageMessage] = useState("")
    const [deletingSite, setDeletingSite] = useState(false)

    const api = process.env.REACT_APP_API_URL
    
    const handleUpload = async (e) =>{
        const file = e.target.files[0]
        if(!file) return

        const formData = new FormData()
        formData.append("file", file)

        setLoading(true)
        try {
            const res = await fetch(`${api}/generate`, {
                method: "POST",
                body: formData
            })

            const data = await res.json()
            setHtml(data.html)
        } catch (error) {
            alert("Something went wrong: "+error.message)
        }finally{
            setLoading(false)
        }
    }

    const handleEdit = async () => {
        if(!message.trim() || !html) return

        const userMsg = {role: "user", content: message}
        setChat(prev => [...prev, userMsg])
        setLoading(true)

        try {
            const res = await fetch(`${api}/edit`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({html: html, instruction: message})
            })

            const data = await res.json()
            setHtml(data.html)
            setChat(prev => [...prev, {role: "assistant", content: "Portfolio updated"}])
            setMessage("")
        } catch (error) {
            alert("Edit Failed: " + error.message)
        } finally{
            setLoading(false)
        }
    }

    const handleDownload = () => {
        const blob = new Blob([html], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "portfolio.html"
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleDeploy = async () => {
        if(!slug.trim() || !html) return

        setDeploying(true)
        setDeployError("")
        setDeployedUrl(data.url)
        setDeleteToken(data.delete_token)

        try {
            const res = await fetch(`${api}/deploy`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({html: html, slug: slug})
            })

            const data = await res.json()

            if(!res.ok){
                setDeployError(data.detail || "Deployment failed")
                return
            }

            setDeployedUrl(data.url)
        } catch (error) {
            setDeployError("Something went wrong: " + error.message)
        } finally {
            setDeploying(false)
        }
    }

    const handleDeleteSite = async () => {
        if(!manageSlug.trim() || !manageToken.trim()) return

        setDeletingSite(true)
        setManageMessage("")

        try {
            const res = await fetch(`${api}/p/${manageSlug.trim()}?token=${encodeURIComponent(manageToken.trim())}`, {
                method: "DELETE"
            })

            const data = await res.json()

            if(!res.ok){
                setManageMessage(data.detail || "Delete failed")
                return
            }

            setManageMessage("Portfolio deleted successfully")
        } catch (error) {
            setManageMessage("Something went wrong: " + error.message)
        } finally {
            setDeletingSite(false)
        }
    }

    return(
        <div style={{ position: "relative", display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden", background: "radial-gradient(ellipse at 10% 20%, rgba(99,102,241,0.12), transparent 10%), radial-gradient(ellipse at 90% 80%, rgba(236,72,153,0.08), transparent 10%), linear-gradient(135deg,#0f172a,#071029)" }}>

            <div style={{ position: "absolute", left: -80, top: "20%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, rgba(74,157,236,0.18), rgba(124,58,237,0.08))", filter: "blur(40px)", zIndex: 0 }} />
            <div style={{ position: "absolute", right: -80, bottom: "15%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle at 70% 70%, rgba(236,72,153,0.14), rgba(245,158,11,0.06))", filter: "blur(48px)", zIndex: 0 }} />

            <div style={{ padding: "16px", background: "rgba(26,26,46,0.85)", color: "white", display: "flex", alignItems: "center", gap: "16px", zIndex: 2, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0 }}>PersonaForge</h2>
                {html && (
                    <>
                        <button 
                            onClick={handleDownload}
                            style={{ 
                            padding: "8px 16px", 
                            background: "#1abc9c", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "6px", 
                            cursor: "pointer" 
                            }}
                        >
                            Download Portfolio
                        </button>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input
                                value={manageSlug}
                                onChange={(e) => setManageSlug(e.target.value)}
                                placeholder="slug to delete"
                                style={{ padding: "6px", borderRadius: "6px", border: "none", fontSize: "12px" }}
                            />
                            <input
                                value={manageToken}
                                onChange={(e) => setManageToken(e.target.value)}
                                placeholder="delete token"
                                style={{ padding: "6px", borderRadius: "6px", border: "none", fontSize: "12px" }}
                            />
                            <button
                                onClick={handleDeleteSite}
                                disabled={deletingSite || !manageSlug.trim() || !manageToken.trim()}
                                style={{
                                    padding: "6px 12px",
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "12px"
                                }}
                            >
                                {deletingSite ? "Deleting..." : "Delete Portfolio"}
                            </button>
                            {manageMessage && <span style={{ fontSize: "12px", color: "#fbbf24" }}>{manageMessage}</span>}
                        </div>

                        {!deployedUrl ? (
                            <>
                                <input
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="choose-a-name"
                                    style={{ padding: "8px", borderRadius: "6px", border: "none" }}
                                />
                                <button
                                    onClick={handleDeploy}
                                    disabled={deploying || !slug.trim()}
                                    style={{
                                        padding: "8px 16px",
                                        background: "#6366f1",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    {deploying ? "Deploying..." : "Deploy"}
                                </button>
                            </>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <a href={deployedUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1abc9c" }}>
                                    {deployedUrl}
                                </a>
                                <span style={{ fontSize: "12px", color: "#fbbf24" }}>
                                    Save this delete token now, it won't be shown again: {deleteToken}
                                </span>
                            </div>
                        )}
                        {deployError && <span style={{ color: "#f87171" }}>{deployError}</span>}
                    </>
                )}
            </div>

            <div style={{ flex: 1, position: "relative", zIndex: 2, display: "flex", flexDirection: "column", minHeight: 0 }}>

                {loading ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
                        <Loader />
                    </div>
                ) : !html ? (
                    <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
                        <Upload handleUpload={handleUpload} />
                    </div>
                ) : (
                    <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
                        <FilePreview
                            html={html}
                            chat={chat}
                            message={message}
                            setMessage={setMessage}
                            handleEdit={handleEdit}
                        />
                    </div>
                )}

            </div>

        </div>
    )
    
}