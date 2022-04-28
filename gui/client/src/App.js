import './App.css';
import { useState, useEffect } from 'react';
import Service from './component/Service/Service';

function App() {

  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch('list');
      const json = await result.json();
      setServices(json);
    };
    fetchData();
  },[])

  const filerChange = (event) => {
    setFilter(event.target.value);
  }

  const filteredData = () => {
    if (filter === '') {
      return services;
    }
    return services.filter(service => {
      return service.hostname.toLowerCase().includes(filter.toLowerCase())
    })
  }


  return (
    <div className="App">
      <div className="service-manage">
        <div className="service-bar">
          <div className="service-bar-search">
            <input value={filter} onChange={filerChange} type="text" placeholder="Search" />
          </div>
        </div>
        <div className="service-list">
          {
            filteredData().map((service, index) => {
              return (
                <div className="service-container">
                  <Service service={service} />
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  );
}

export default App;
