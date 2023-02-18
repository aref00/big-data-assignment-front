import axios from 'axios';
import { useState } from 'react';
import { Input } from 'tayeh-react';
import { useDebouncedCallback } from 'use-debounce';
import './App.css';
import Graph from "react-graph-vis";

const handler = async (phrase, setUsers, setGraphs) => {
	const res = await axios.post('http://localhost:8002', phrase)
	setUsers(res.data.users);
	const nodes = res.data.users.map((u) => ([{id: u.sourceusername, label: u.sourceusername, title: u.sourcefullname},{id: u.targetusername, label: u.targetusername, title: u.targetfullname}])).reduce((array, item) => [...array, ...item], []);
	// 
	const graph = {nodes: nodes.filter((n, i) => nodes.map(t => t.id).indexOf(n.id) === i), edges: res.data.users.map((u) => ({from: u.sourceusername, to: u.targetusername}))}
	console.log(graph);
	setGraphs(graph);
}

function App() {
	const [users, setUsers] = useState([])
	const [graphData, setGraphData] = useState({nodes: [], edges: []})
	const [loading, setLoading] = useState(false)

	const search = async (event) => {
		setLoading(true);
		await handler(event.target.value, setUsers, setGraphData);
		setLoading(false);
	}
	const debounced = useDebouncedCallback(search, 700)
	const options = {
		layout: {
		  hierarchical: false
		},
		edges: {
		  color: "#000000"
		},
		height: "500px"
	  };
  return (
    <div className="App ty-bg-dark ty-container">
		<div className='content'>
		<header className="App-header">
		<Input radius={15} placeholder='Search By Username' label='Search Trough Users' onChange={debounced} tyClass="full-width"/>
      </header>
	  <div className='ty-bg-light border-radius-15 my-2 my-sm-3 my-md-4' style={{height: '500px'}}>
	  {
		!loading&&<Graph
      graph={graphData}
      options={options}
    />||<div className='full-width text-center pt-5'>LOADING...</div>}
	  </div>
	  <div className='ty-content'>
		{
			users.map((user, index) => {
				return (<div className='ty-flex ty-space-between' key={index}>
					<div>username: <span className='fw-900'>{user.sourceusername}</span>, fullname: <span className='fw-900'>{user.sourcefullname}</span></div>
					<div>similarity factor: <span className='fw-900'>{user.difference}</span></div>
					</div>)
			})
		}
	  </div>
		</div>
    </div>
  );
}

export default App;
