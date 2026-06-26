import axios from "axios";
const BASE="http://localhost:8000";
export const getToken=()=>localStorage.getItem("event_admin_token");
export const setToken=(t)=>localStorage.setItem("event_admin_token",t);
export const removeToken=()=>localStorage.removeItem("event_admin_token");
export const getHeaders=()=>({Authorization:`Bearer ${getToken()}`});
const checkSession=async()=>{
  const token=getToken();if(!token)return{isAuth:false,session:null};
  try{const res=await axios.get(`${BASE}/session`,{headers:getHeaders()});const ud=res.data.userData;if(ud?.session?.role==="Admin")return{isAuth:true,session:ud.session};removeToken();return{isAuth:false,session:null};}
  catch{removeToken();return{isAuth:false,session:null};}
};
export default checkSession;
