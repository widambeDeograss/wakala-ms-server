const pool = require("../model/model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jwtTokens = require("../middlewares/jwthelpers");
const salt_rounds = 10;

const register_controler =  async (req, res, next) => {
    const user_fname = req.body.user_fname
    const user_lname = req.body.user_lname
    const user_email = req.body.user_email
    const user_password = req.body.user_password
    const user_profile = req.body.user_profile

      bcrypt.hash(user_password, salt_rounds).then(
        hashed => {
            console.log(hashed);
           pool.query('INSERT INTO users (user_fname, user_lname, user_email, user_password, user_profile) VALUES($1,$2,$3,$4,$5) RETURNING *',
           [user_fname, user_lname, user_email, hashed, user_profile])
                        .then(user => {
                            res.status(201).json({
                                message:"user created succesfully",
                                user:{
                                    user_password:hashed,
                                    user:user.rows[0]
                                }
                            })
                        }).catch(error => {
                            res.status(500).json({error:error.message,
                                                  data:"user wasnt created database problems"})
                        })  
        }
      ).catch(error => {
        res.status(500).json({error:error.message})
      })
    }

const login_controler = (req, res, next) => {
    const user_email = req.body.user_email
    const user_password = req.body.user_password

    pool.query('SELECT * FROM users WHERE user_email = $1', [user_email])
    .then(user => {
        if (user.rows.length === 0) {
            res.status(401).json({data:"the was no match for the email"}) 
        }else{
            bcrypt.compare(user_password, user.rows[0].user_password)
            .then(doMatch => {
               if (doMatch) {
                //jwts
                const tokens = jwtTokens(user.rows[0]);
                
                res.cookie("refresh_token", tokens.refeshToken, {httpOnly:true, sameSite:'none', secure:true});
                res.status(200).json({
                    token:tokens.accessToken,
                    user:user.rows[0]
                })
               } else {
                res.status(401).json({error:"incorreact password login failed"});
               }
            })
            .catch(error => console.log(error));
        }
       
    }).catch(
        error => {
            res.status(500).json({error:"server error"})
        }
    )
    
}

const refresh_token_controler = (req, res) => {

      try {
        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken) {
            res.status(401).json({error:"null no refresh token provided"})
        } else {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
                const tokens = jwtTokens(user);
                res.cookie("refresh_token", tokens.refeshToken, {httpOnly:true});
                res.status(200).json({
                    token:tokens.accessToken,
                    user:user.rows[0]
                })
            })    
        }  
      } catch (error) {
        res.status(401).json({error:error.message})
        
      }
      

}

const logout_controler = (req, res, next) => {

    try {
        res.clearCookie("refresh_token");
        res.status(200).json({message:"the refresh token deleted succesfully"})
    } catch (error) {
        res.status(401).json({error:error.message})
    }
}
module.exports = {register_controler, login_controler, logout_controler, refresh_token_controler}