import "./Service.css";
import { useState } from "react";
import {FiLock,FiEyeOff,FiEye,FiTrash,FiPlusCircle} from "react-icons/fi";

const Service = ({ service }) => {

    const [showConf, setShowConf] = useState(false);
    const [confs, setConfs] = useState([]);

    const showConfig = (conf) => {
        setConfs([])
        if(conf){
            setConfs(conf);
        }
        setShowConf(!showConf);
    }

    const addConfig = () => {

    }

    return (
        <div className="service-cnt">
            <div className="service">
                <div className="service-name medium">{service.hostname}</div>
                <div className="service-target medium">{service.target}</div>
                <div className="service-timeout small">{service.timeout}</div>
                <div className="service-auth small icon"><FiLock /></div>
                <div className="service-ignore small icon" onClick={()=>{ showConfig(service.ignore) }}><FiEyeOff /></div>
                <div className="service-authOnly small icon" onClick={() => { showConfig(service.authOnly) }}><FiEye /></div>
                <div className="service-delete small icon"><FiTrash /></div>
            </div>
            {(showConf) ? (
                <div className="service-conf">
                    <div className="service-conf-list">
                        {confs.map((conf, index) => {
                            return (
                                <div className="service-conf-item">
                                    <div className="service-conf-value">{conf}</div>
                                    <div className="service-conf-remove"><FiTrash /></div>
                                </div>
                            )
                        })}
                        <div className="service-conf-add" onClick={() => { addConfig() }}>
                            <button className="add-icon"><FiPlusCircle /></button>
                        </div>
                    </div>
                </div>) : (null)}
        </div>
    );
}

export default Service;