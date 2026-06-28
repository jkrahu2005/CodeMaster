import axios from "axios";

const axiosClient = axios.create({
    baseURL: 'https://code-master-sand-six.vercel.app',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosClient;
