import "./Service.css";
import {FiLock,FiEyeOff,FiEye} from "react-icons/fi";

const Service = ({ service }) => {
    return (
        <div className="service-cnt">
            <div className="service">
                <div className="service-name medium">{service.hostname}</div>
                <div className="service-target medium">{service.target}</div>
                <div className="service-timeout small">{service.timeout}</div>
                <div className="service-auth small icon"><FiLock /></div>
                <div className="service-ignore small icon"><FiEyeOff /></div>
                <div className="service-authOnly small icon"><FiEye /></div>
            </div>
        </div>
    );
}

export default Service;