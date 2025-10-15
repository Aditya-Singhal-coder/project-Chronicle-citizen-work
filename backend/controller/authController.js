
export const Login = async(req,res)=>{
    const {username, email, password} = req.body;
    console.log("login");
    res.json({"status":"true"});
}
export const register = async(req,res)=>{
    console.log("register");
    res.json({"status":"true"});
}