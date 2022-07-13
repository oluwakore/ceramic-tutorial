import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import { providers } from "ethers";
import Web3Modal from "web3modal";
import { useViewerConnection } from "@self.id/react";
import { EthereumAuthProvider } from "@self.id/web";
import { useViewerRecord } from "@self.id/react";
import { Button, Form, Input, Select } from 'antd'
import styles from "../styles/Home.module.css";


const { Option } = Select

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16, 
  },
};

export default function Home() {
  // const [name, setName] = useState("");
  // const [gender, setGender] = useState("");

  const [form] = Form.useForm()

 

  const web3ModalRef = useRef();

  const getProvider = async () => {
    const provider = await web3ModalRef.current.connect();
    const wrappedProvider = new providers.Web3Provider(provider);
    return wrappedProvider;
  };

  const [connection, connect, disconnect] = useViewerConnection();

  useEffect(() => {
    if (connection.status !== "connected") {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
  }, [connection.status]);

  const getEthereumAuthProvider = async () => {
    const wrappedProvider = await getProvider();
    const signer = wrappedProvider.getSigner();
    const address = await signer.getAddress();
    return new EthereumAuthProvider(wrappedProvider.provider, address);
  };

  const connectToSelfID = async () => {
    const ethereumAuthProvider = await getEthereumAuthProvider();
    connect(ethereumAuthProvider);
  };

  function RecordSetter() {
    const record = useViewerRecord("basicProfile");

    const updateRecordNameAndGender = async (name, gender) => {
      await record.merge({
        name: name,
        gender: gender
      });
    };
    
    const onFinish = (values) => {

      const { name, gender } = values
  
      updateRecordNameAndGender(name, gender) 

      form.resetFields()
    }
  

    return (
      <div className={styles.content}>
        <div className={styles.mt2}>
          {record.content ? (
            <div className={styles.flexCol}>
              <span className={styles.subtitle}>
                Hello {record.content.name}! {record.content.gender === 'other' ? 'your gender is unknown' : `your gender is ${record.content.gender}`} 
              </span>
  
              <span>
                The above name and gender was loaded from Ceramic Network. Try updating it
                below.
              </span>
            </div>
          ) : (
            <span>
              You do not have a profile record attached to your 3ID. Create a
              basic profile by setting a name and gender below.
            </span>
          )}
        </div>
            
        <Form  form={form} name="ceramic-form" 
        onFinish={onFinish}  
        >
          <Form.Item
           name="name"
           label="Name"
           rules={[
            {
              required: true
            }
           ]}
            >
            <Input />
          </Form.Item>
           <Form.Item
           name="gender"
           label="Gender"
           rules={[
            {
              required: true
            }
           ]}
           >
            <Select
            placeholder="Select an option"
            allowClear
            >
              <Option value="male" >male</Option>
              <Option value="female" >female</Option>
              <Option value="other" >other</Option>
            </Select>
           </Form.Item>
           <Button style={{marginLeft: "120px"}} type="primary" htmlType="submit">
            Update
           </Button>
        </Form>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <Head>
        <title>Ceramic Tutorial</title>
        <meta name="description" content="Ceramic-tutorial" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.navbar}>
        <span className={styles.title}>Ceramic Demo</span>
        {connection.status === "connected" ? (
          <span className={styles.subtitle}>Connected</span>
        ) : (
          <button
            onClick={connectToSelfID}
            className={styles.button}
            disabled={connection.status === "connecting"}
          >
            Connect
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.connection}>
          {connection.status === "connected" ? (
            <div>
              <span className={styles.subtitle}>
                Your 3ID is {connection.selfID.id}
              </span>
              <RecordSetter />
            </div>
          ) : (
            <span className={styles.subtitle}>
              Connect with your wallet to access your 3ID
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
