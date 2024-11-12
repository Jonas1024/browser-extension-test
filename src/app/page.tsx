// app/page.js
"use client";
import { useEffect, useState } from "react";
import { Button, Card, Col, Input, message, Row, Typography } from "antd";
import { CSSProperties } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Home() {
  const [sdr, setSdr] = useState("");
  const [vcUrl, setVcUrl] = useState("");
  const [templateString, setTemplateString] = useState(""); // 保存模板的字符串

  const [polling, setPolling] = useState(false); // 标志位
  const [data, setData] = useState("");
  const [isHovering, setIsHovering] = useState(false); // 用于跟踪悬停状态


  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/proof");
      const json = await res.json();
      console.log("proof: " + JSON.stringify(json));
      if (json.data) {
        setData(json.data); // 存储获取到的数据
        setPolling(false); // 请求到数据后停止轮询
      }
    };

    let interval: NodeJS.Timeout;
    if (polling) {
      fetchData(); // 立即请求一次
      interval = setInterval(fetchData, 5000); // 设置定时器，每 5 秒轮询一次
    }

    // 清除定时器
    return () => clearInterval(interval);
  }, [polling]);

  // 加载 JSON 模板
  useEffect(() => {
    fetch("/sdr.json")
      .then((response) => response.text())
      .then((data) => setTemplateString(data))
      .catch((error) => console.error("加载模板文件失败:", error));
  }, []);

  // 处理替换逻辑
  const handleReplaceContent = (): string => {
    if (!templateString) {
      return "";
    }
    if (!sdr.trim()) {
      return "";
    }

    const updatedTemplateString = templateString.replace(`"replace"`, sdr);
    return updatedTemplateString;
  };

  const triggerGetVCEvent = () => {
    console.log("triggerGetVCEvent");
    if (!vcUrl.trim()) {
      return;
    }

    console.log("getVC: " + vcUrl);
    // 创建并触发 authEvent 事件，将 authUrl 作为事件的 detail
    const event = new CustomEvent("authEvent", { detail: vcUrl });
    document.dispatchEvent(event);
  };

  const triggerProofEvent = () => {
    console.log("triggerProofEvent");

    if (!sdr.trim()) {
      return;
    }

    const content = handleReplaceContent();
    const base64 = btoa(content);
    const getProof = "iden3comm://?i_m=" + base64;
    console.log("getProof: " + getProof);

    // 创建并触发 authEvent 事件，将 authUrl 作为事件的 detail
    const event = new CustomEvent("authEvent", { detail: getProof });
    document.dispatchEvent(event);

    setPolling(true);
  };

  useEffect(() => {
    // 确保在客户端环境下触发事件
    console.log("Page loaded, ready to trigger auth event.");
  }, []);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(JSON.stringify(data, null, 2))
      .then(() => {
        console.log("JSON 已复制到剪贴板");
      })
      .catch(() => {
        console.log("复制失败，请重试");
      });
  };

  return (
    <>
      <Typography.Title level={3} style={styles.title}>
        Browser Extension Test
      </Typography.Title>
      <Row gutter={16} style={{ padding: 20 }}>
        <Col span={12}>
          <div style={{ marginBottom: 24 }}>
            <Input.TextArea
              rows={6}
              value={vcUrl}
              onChange={(e) => setVcUrl(e.target.value)}
              placeholder="vc url..."
              style={styles.textArea}
            />

            <Button
              type="primary"
              style={styles.button}
              onClick={triggerGetVCEvent}
            >
              Receive VC
            </Button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input.TextArea
              rows={6}
              value={sdr}
              onChange={(e) => setSdr(e.target.value)}
              placeholder="sdr info..."
              style={styles.textArea}
            />
            <Button
              type="default"
              style={styles.button}
              onClick={triggerProofEvent}
            >
              Get Proof
            </Button>
          </div>
        </Col>

        <Col span={12}>
          <Card
            title="Proof 数据展示"
            style={{ maxHeight: 600, overflow: "auto" }}
          >
            {data && (
              <div
              style={styles.jsonContainer}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Button
                style={{
                  ...styles.copyButton,
                  opacity: isHovering ? 1 : 0, // 根据悬停状态控制按钮透明度
                }}
                onClick={handleCopy}
              >
                copy
              </Button>
                <SyntaxHighlighter language="json" style={prism}>
                  {JSON.stringify(data, null, 2)}
                </SyntaxHighlighter>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "20px",
  },
  title: {
    marginBottom: "20px",
    marginTop: "20px",
    color: "#166CFF",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: "300px",
  },
  button: {
    width: "100%",
    marginTop: 8,
  },
  textArea: {
    height: "250px",
  },
  jsonContainer: {
    position: 'relative',
    width: '100%',
  },
  copyButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    transition: 'opacity 0.3s ease',
    zIndex: 1,
  },
};
