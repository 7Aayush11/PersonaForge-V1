import Input from "./Input";

export default function Upload({ handleUpload }) {
    return (
        <div
            style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "24px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    alignItems: "center",
                    maxWidth: 420,
                    width: "100%",
                    textAlign: "center",
                }}
            >
                <p style={{ color: "#e6eef8", fontSize: 18, margin: 0 }}>Upload your resume to generate your portfolio</p>

                <Input onChange={handleUpload} text={"Upload resume"} />
            </div>
        </div>
    );

}