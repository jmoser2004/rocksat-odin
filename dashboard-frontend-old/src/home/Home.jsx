import { useEffect } from 'react'
import { Client } from '@stomp/stompjs'
import ProjectODINLogo from '../assets/ProjectODINLogo.png'
import dummy from '../assets/dummy_histogram.png'
import './home.css'

function Home()
{
    useEffect(() => {
    const client = new Client({
        brokerURL: "ws://localhost:8080/ws",
        reconnectDelay: 5000,
    })

    client.onConnect = () => {
        console.log("STOMP connected")

        client.subscribe('/topic/messages', (message) => {
	    const text = new TextDecoder().decode(message._binaryBody)
	    console.log("Decoded payload:", text)
	})
    }

    client.onStompError = (frame) => {
        console.error("Broker error:", frame.headers['message'])
    }

    client.activate()

    return () => client.deactivate()
}, [])


    return (
        <div className='homeBody'>
            <div className='logoDiv'>
                <img className='logo' src={ProjectODINLogo} />
            </div>
            <div className='graphs'>
                <table className='graph tableGraph'>
                    <thead className='tableHeader'>
                        <tr className='tableHeaderRow'>
                            <th className='tableHeaderItem dg' colSpan="2">Voltages</th>
                        </tr>
                        <tr className='tableHeaderRow'>
                            <th className='tableHeaderItem'>Sensor</th>
                            <th className='tableHeaderItem'>Voltage</th>    
                        </tr>
                    </thead>
                    <tr className='tableBody'>
                        <td className='tableBodyItem'>Spectrometer 1</td>
                        <td className='tableBodyItem g'>3.3V</td>
                    </tr>
                    <tr className='tableBody'>
                        <td className='tableBodyItem'>Spectrometer 2</td>
                        <td className='tableBodyItem g'>3.3V</td>
                    </tr>
                    <tr className='tableBody'>
                        <td className='tableBodyItem'>Jetson</td>
                        <td className='tableBodyItem g'>12V</td>
                    </tr>
                </table>

                <table className='graph tableGraph'>
                    <thead className='tableHeader'>
                        <tr className='tableHeaderRow'>
                            <th className='tableHeaderItem dg' colSpan="3">AI Data</th>
                        </tr>
                        <tr className='tableHeaderRow'>
                            <th className='tableHeaderItem'>Instrument</th>
                            <th className='tableHeaderItem'>Label</th>
                            <th className='tableHeaderItem'>Confidence</th>
                        </tr>
                    </thead>
                    <tr className='tableBody'>
                        <td className='tableBodyItem'>Spectrometer 1</td>
                        <td className='tableBodyItem'>K-40</td>
                        <td className='tableBodyItem g'>92.4</td>
                    </tr>
                    <tr className='tableBody'>
                        <td className='tableBodyItem'>Spectrometer 1</td>
                        <td className='tableBodyItem'>Cs-137</td>
                        <td className='tableBodyItem r'>27.3</td>
                    </tr>
                    <tr className='tableBody'>
                        <td className='tableBodyItem'>Spectrometer 2</td>
                        <td className='tableBodyItem'>Sun</td>
                        <td className='tableBodyItem g'>85.2</td>
                    </tr>
                </table>

                <table className='graph tableGraph'>
                    <thead className='tableHeader'>
                        <tr className='tableHeaderRow'>
                            <th className='tableHeaderItem dg' colSpan="4">Attitude</th>
                        </tr>
                        <tr className='tableHeaderRow'>
                            <th className='tableHeaderItem'>(ψ, θ, φ)</th>
                            <th className='tableHeaderItem'>(Q1, Q2, Q3, Q4)</th>
                            <th className='tableHeaderItem'>B-Field</th>
                            <th className='tableHeaderItem'>Gravity</th>
                        </tr>
                    </thead>
                    <tr className='tableBody'>
                        <td className='tableBodyItem' rowSpan="3">(30°, -70°, 25°)</td>
                        <td className='tableBodyItem' rowSpan="3">(0.3, 0.2, -0.1, 0.9)</td>
                        <td className='tableBodyItem' rowSpan="3">(0.3, 0.1, -0.2)</td>
                        <td className='tableBodyItem' rowSpan="3">(0.2, 0.1, 0.7)</td>
                    </tr>
                </table>

                <table className='graph tableGraph'>
                    <thead className='tableHeader'>
                        <tr className='tableHeaderRow'>
                            <th className='tableHeaderItem dg' colSpan="2">Temperatures</th>
                        </tr>
                        <tr className='tableHeaderRow'>
                            <th className='tableHeaderItem'>Sensor</th>
                            <th className='tableHeaderItem'>Temperature</th>
                        </tr>
                    </thead>
                    <tr className='tableBody'>
                        <td className='tableBodyItem'>Spectrometer 1</td>
                        <td className='tableBodyItem g'>2°C</td>
                    </tr>
                    <tr className='tableBody'>
                        <td className='tableBodyItem'>Spectrometer 2</td>
                        <td className='tableBodyItem g'>3°C</td>
                    </tr>
                    <tr className='tableBody'>
                        <td className='tableBodyItem'>Jetson</td>
                        <td className='tableBodyItem y'>67°C</td>
                    </tr>
                </table>

                <table className='graph tableGraph'>
                    <thead className='tableHeader'>
                        <tr className='tableHeaderRow'>
                            <th className='tableHeaderItem dg'>Spectrometer Data</th>
                        </tr>
                    </thead>
                    <tr className='tableBody'>
                        <td className='tableBodyItem'>
                            <img className='histogram' src={dummy} />
                        </td>
                    </tr>
                </table>

                <table className='graph tableGraph'>
                    <thead className='tableHeader'>
                        <tr className='tableHeaderRow'>
                            <th className='tableHeaderItem dg' colSpan="3">Mission Info</th>
                        </tr>
                        <tr className='tableHeaderRow'>
                            <th className='tableHeaderItem'>Altitude</th>
                            <th className='tableHeaderItem'>Mission Timer</th>
                            <th className='tableHeaderItem'>Time till Apogee</th>
                        </tr>
                    </thead>
                    <tr className='tableBody'>
                        <td className='tableBodyItem'>118 km</td>
                        <td className='tableBodyItem'>12:33.04</td>
                        <td className='tableBodyItem'>1:04.33</td>
                    </tr>
                </table>
            </div>
        </div>
    )
}

export default Home
