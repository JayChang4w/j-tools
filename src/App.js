import "antd/dist/antd.css";
import "./index.css";
import "jszip";
import * as XLSX from "xlsx";
import {
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  ShopOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Radio, message, Upload, InputNumber, Layout, Menu, Descriptions  } from "antd";
import { useState, useEffect, createElement } from "react";
const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  //const reader = new FileReader();
  const [form] = Form.useForm();
  const [gear, setGear] = useState("5");
  const [price, setPrice] = useState("280");
  const [lot, setLot] = useState("10");
  const [fileList, setFileList] = useState([]);
  const [workbook, setWorkbook] = useState({});
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const menuItems = [
    ToolOutlined,
  ].map((icon, index) => ({
    key: String(index + 1),
    icon: createElement(icon),
    label: '小工具',
  }));

  const fileProps = {
    accept: ".xlsx,.xls,.ods,.csv",
    onRemove: (file) => {
      setFileList([]);
      setWorkbook(null);
      setDisabled(true);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      setLoading(true);

      readFile(file)
        .then((data) => {
          let wb = XLSX.read(data, {
            type: "binary",
            raw: true,
          });

          setWorkbook(wb);
        })
        .catch((err) => {})
        .finally(() => {
          setLoading(false);
          setDisabled(false);
        });
      return false;
    },
    fileList,
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = reject;
      fr.onload = () => {
        resolve(fr.result);
      };
      fr.readAsBinaryString(file);
    });
  };

  const exportFile = (data) => {
    /* make the worksheet */
    const fieldsWS = XLSX.utils.json_to_sheet(data);
    /* add to workbook */
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, fieldsWS, "結果");
    /* generate an XLSX file */
    XLSX.writeFileXLSX(wb, "sheets.xlsx");
  };

  const getObjArray = () => {
    var result = [];

    if (workbook) {
      workbook.SheetNames.forEach(function (sheetName) {
        var items = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheetName]
        );
        result.push(items);
      });
    } else {
      //throw new Error('excel檔案未上傳或格式錯誤!');
      alert("excel檔案未上傳或格式錯誤!");
    }

    return result;
  };

  const onBtnClick = () => {
    // try {
    //   const values = await form.validateFields();
    //   console.log('Success:', values);
    // } catch (errorInfo) {
    //   console.log('Failed:', errorInfo);
    //   return;
    // }

    const datas = getObjArray();

    if (datas.length == 0) {
      return;
    }

    const results = [];

    let _price = parseFloat(price);

    datas[0].forEach((item, index) => {
      let result = { ...item };

      if (index === 0) {
        result["買"] = _price;
        result["賣"] = "";
        result["口數"] = parseInt(lot);
      } else {
        let min = parseFloat(item["最低價"]);
        let max = parseFloat(item["最高價"]);

        if (max >= _price + parseFloat(gear)) {
          let _lot = parseInt((max - _price) / parseFloat(gear));

          _price = parseFloat(_price + _lot * parseFloat(gear));
          result["買"] = "";
          result["賣"] = _price;
          result["口數"] = _lot;
        } else if (min <= _price - parseFloat(gear)) {
          let _lot = parseInt((_price - min) / parseFloat(gear));
          _price = parseFloat(_price - _lot * parseFloat(gear));
          result["買"] = _price;
          result["賣"] = "";
          result["口數"] = _lot;
        } else {
          result["買"] = "";
          result["賣"] = "";
          result["口數"] = "";
        }
      }

      results.push(result);
    });

    //console.log(results);
    //console.log(results.length);
    exportFile(results);
  };

  return (
      <Layout>
        <Header className="header">
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} items={menuItems} />
        </Header>
        <Content
          style={{
            padding: '0 50px',
            marginTop: ' 30px'
          }}
        >
          <Form
            form={form}
            initialValues={{
              gear: "5",
              price: "28",
              lot: "10",
              workbook: {},
            }}
          >
            <Form.Item
              label="檔位"
              value={gear}
              onChange={(e) => setGear(parseFloat(e.target.value))}
              rules={[
                {
                  required: true,
                  message: "必填",
                },
              ]}
            >
              <InputNumber
                placeholder="請輸入數值"
                value={gear}
                min={0}
                step={0.5}
              />
            </Form.Item>
            <Form.Item
              label="初始價格"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              rules={[
                {
                  required: true,
                  message: "必填",
                },
              ]}
            >
              <InputNumber
                placeholder="請輸入正整數"
                value={price}
                min={1}
                step={0.5}
              />
            </Form.Item>
            <Form.Item
              label="初始口數"
              value={lot}
              onChange={(e) => setLot(parseInt(e.target.value))}
              rules={[
                {
                  required: true,
                  message: "必填",
                },
              ]}
            >
              <InputNumber
                placeholder="請輸入正整數"
                value={lot}
                min={1}
                step={1}
              />
            </Form.Item>
            <Form.Item>
              <Upload {...fileProps}>
                <Button icon={<UploadOutlined />}>請選擇檔案</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button
                loading={loading}
                disabled={disabled}
                type="primary"
                onClick={() => onBtnClick()}
              >
                匯出結果
              </Button>
            </Form.Item>
          </Form>
          <Descriptions
      title="說明"
      bordered
      column={1}
    >
      <Descriptions.Item label="#檔位">預設值為 5</Descriptions.Item>
      <Descriptions.Item label="#起始口數">預設值為 10</Descriptions.Item>
      <Descriptions.Item label="#起始價位">預設值為 280</Descriptions.Item>
      <Descriptions.Item label="#最高價">從Excel中讀取，標頭請取名為 #最高價</Descriptions.Item>
      <Descriptions.Item label="#最低價">從Excel中讀取，標頭請取名為 #最低價</Descriptions.Item>
      <Descriptions.Item label="賣出條件">
      #最高價 &gt;= #前一交易價 + #檔位 =&gt; 賣出，#交易口數 = (#最高價 - #前一交易價) / #檔位; #交易價格 = #前一交易價格 + (#交易口數 X #檔位)
      </Descriptions.Item>
      <Descriptions.Item label="買入條件">
      #最低價 &lt;= #前一交易價 - #檔位 =&gt; 買入，交易口數 = (#前一交易價 - #最低價) / #檔位; #交易價格 = #前一交易價格 - (#交易口數 X #檔位)
      </Descriptions.Item>
    </Descriptions> 
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          J-Tools ©2022 Created by Jay Chang
        </Footer>
      </Layout>
  );
};

export default App;
