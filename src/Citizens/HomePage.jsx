import React, { useEffect } from 'react'
import axios from 'axios'

function HomePage() {
    const BASE_URL = process.env.BASE_URL
    const [data, setData] = React.useState(null)
    useEffect(() => {
        try {
            const res = axios.get(`${BASE_URL}/user`)
            console.log(res.data)
            setData(res.data)
        } catch (err) {
            console.error(err)
        }
    }, [])

    return (
        <div>{data}</div>
    )
}

export default HomePage;