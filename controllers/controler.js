const pool = require("../model/model");
// const async = require("async");

exports.homevw = (req, res, next) => {
    pool.query("SELECT * FROM companies")
        .then(companies => {
            if (companies.rows.length === 0) {
                res.status(200).json({
                    data: "no users at the moment",
                    message: "welcome to the wakala-ms api"
                })
            } else {
                const company_data = companies.rows
                res.status(201).json(company_data);
            }
        })

}

exports.getAgency = (req, res, next) => {
    const user_id = req.user.user_id
    pool.query("SELECT * FROM user_agencies WHERE user_id = $1", [user_id])
        .then(async agency => {
            if (agency.rows.length === 0) {
                const agency_data = agency.rows
                res.status(200).json(agency_data)
            } else {
                const a = []
                const agency_data = agency.rows
                async function data_ag() {
                    for (const data of agency_data) {
                        await pool.query("SELECT * FROM companies WHERE company_id = $1", [data.company_id])
                            .then(async company => {
                                if (!company) {
                                    console.log('no company for the id found in the database');
                                } else {
                                    var item_data = {
                                        agency_id: data.agency_id,
                                        company: company.rows[0].company_name
                                    }
                                    a.push(item_data);
                                }
                            })
                    }
                    return a
                }
                const data = await data_ag();
                res.status(201).json(data)
            }
        })
}



exports.agency_contrroler = (req, res, next) => {
    const company_name = req.body.company_name
    const user_id = req.user.user_id
    pool.query("SELECT * FROM companies WHERE company_name = $1", [company_name])
        .then(company => {
            if (company.rows.length === 0) {
                res.status(401).json({ error: "the company doest exist" });
            } else {
                const company_id = company.rows[0].company_id
                pool.query("INSERT INTO user_agencies(company_id, user_id) VALUES($1,$2) RETURNING *",
                    [company_id, user_id])
                    .then(agency => {
                        res.status(201).json({
                            message: "succesfully created the agency",
                            agency: agency.rows[0]
                        })
                    })
                    .catch(error => {
                        res.status(401).json({ error: error.message })
                    })
            }
        })
        .catch(error => {
            res.status(401).json({ error: error.message })
        })
};


exports.getFloatBalance = (req, res) => {
    const company_name = req.body.company_name
    const user_id = req.user.user_id
    const day_date = req.body.day_date
    pool.query("SELECT * FROM companies WHERE company_name = $1", [company_name])
        .then(company => {
            if (company.rows.length === 0) {
                console.log("no company found");
            } else {
                pool.query("SELECT * FROM user_agencies WHERE company_id = $1 and user_id = $2", [company.rows[0].company_id, user_id])
                    .then(agency => {
                        if (agency.rows.length === 0) {
                            console.log("the agency wasnot found");
                        } else {
                            pool.query("SELECT * FROM float_balances WHERE agency_id = $1 AND daya_date = $2", [agency.rows[0].agency_id, day_date])
                                .then(float => {
                                    if (float.rows.length === 0) {
                                        res.status(201).json({ message: "bussines not open" })
                                    } else {
                                        const float_data = float.rows[0].opening_float
                                        res.status(201).json({
                                            message: "bussines open",
                                            float: float_data
                                        })
                                    }
                                })
                        }
                    })
                    .catch(error => {
                        res.status(500).json({ error: error.message })
                    })

            }
        }).catch(error => {
            res.status(403).json({ error: error.message })
        })

}


exports.getCashBalance = (req, res) => {
    const user_id = req.user.user_id
    const day_date = req.body.day_date
    pool.query("SELECT * FROM cash_balances WHERE user_id = $1 AND day_date = $2", [user_id, day_date])
        .then(cash => {
            if (cash.rows.length === 0) {
                res.status(201).json({ message: "bussiness day cash not set" })
            } else {
                const cash_data = cash.rows[0].opening_cash
                res.status(201).json({
                    message: "cash set",
                    cash: cash_data
                })
            }
        })
        .catch(error => {
            res.status(500).json({ error: error.message })
        })

}


exports.open_Cashbusiness_controler = (req, res) => {
    const user_id = req.user.user_id
    const day_date = req.body.day_date
    const opening_cashBalance = req.body.opening_cashBalance
    pool.query("INSERT INTO cash_balances(user_id, day_date, opening_cash, closing_cash) VALUES($1,$2,$3,$4)",
        [user_id, day_date, opening_cashBalance, opening_cashBalance])
        .then(cash => {
            res.status(201).json({
                message: "succesfully created the opening cash and float balance",
            })
        })
        .catch(error => {
            res.status(500).json({ error: error.message })
        });
}

exports.open_Floatbusiness_controler = (req, res) => {
    const company_name = req.body.company_name
    const user_id = req.user.user_id
    const day_date = req.body.day_date
    const opening_floatBalance = req.body.opening_float

    pool.query("SELECT * FROM companies WHERE company_name = $1", [company_name])
        .then(company => {
            if (company.rows.length === 0) {
                console.log("no company found");
            } else {
                pool.query("SELECT * FROM user_agencies WHERE company_id = $1 and user_id = $2", [company.rows[0].company_id, user_id])
                    .then(agency => {
                        if (agency.rows.length === 0) {
                            console.log("the agency wasnot found");
                        } else {
                            pool.query("INSERT INTO float_balances(agency_id, daya_date, opening_float, closing_float) VALUES($1,$2,$3,$4)",
                                [agency.rows[0].agency_id, day_date, opening_floatBalance, opening_floatBalance])
                                .then(float => {
                                    console.log(float.command);
                                })
                                .catch(error => {
                                    res.status(500).json({ error: error.message })
                                });
                        }
                    })
                    .catch(error => {
                        res.status(500).json({ error: error.message })
                    })

            }
        }).catch(error => {
            res.status(403).json({ error: error.message })
        })
}


exports.getDayTransactions = (req, res) => {
    const company_name = req.body.company_name
    const user_id = req.user.user_id
    const transaction_date = req.body.transaction_date

    pool.query("SELECT * FROM companies WHERE company_name = $1", [company_name])
        .then(company => {
            if (company.rows.length === 0) {
                // res.status(401).json({error:"the company was not registerd"}) ;
            } else {
                pool.query("SELECT * FROM user_agencies WHERE company_id = $1 and user_id = $2", [company.rows[0].company_id, user_id])
                    .then(agency => {
                        if (agency.rows.length === 0) {
                            // res.status(401).json({error:"the agency was not found"}) ;
                        } else {
                            pool.query("SELECT * FROM transactions WHERE agency_id=$1 AND transaction_date=$2", [agency.rows[0].agency_id, transaction_date])
                                .then(transactions => {

                                    const transaction_data = transactions.rows
                                    res.status(201).json(transaction_data)

                                }).catch(error => {
                                    res.status(500).json({ error: error.message })
                                });

                        }
                    }
                    )
                    .catch(error => {
                        res.status(500).json({ error: error.message })
                    });
            }
        }).catch(error => {
            res.status(500).json({ error: error.message })
        });


}

exports.transactions_controler = (req, res) => {
    const company_name = req.body.company_name
    const user_id = req.user.user_id
    const transaction_type = req.body.transaction_type
    const transaction_date = req.body.transaction_date
    const transaction_time = req.body.transaction_time
    const transaction_amont = req.body.transaction_amont

    pool.query("SELECT * FROM companies WHERE company_name = $1", [company_name])
        .then(company => {
            if (company.rows.length === 0) {
                res.status(401).json({ error: "the company was not registerd" });
            } else {
                pool.query("SELECT * FROM user_agencies WHERE company_id = $1 and user_id = $2", [company.rows[0].company_id, user_id])
                    .then(agency => {
                        if (agency.rows.length === 0) {
                            res.status(401).json({ error: "the agency was not found" });
                        } else {
                            pool.query("INSERT INTO transactions(transaction_type, transaction_date, transaction_time, transaction_amont, agency_id) VALUES($1,$2,$3,$4,$5)",
                                [transaction_type, transaction_date, transaction_time, transaction_amont, agency.rows[0].agency_id])
                                .then(transaction => {
                                    res.status(201).json({ message: "succesfully created the transaction" });
                                })
                                .catch(error => {
                                    console.log(error);
                                    res.status(500).json({ error: error.message })
                                });
                        }
                    }
                    )
                    .catch(error => {
                        res.status(500).json({ error: error.message })
                    });
            }
        }).catch(error => {
            res.status(500).json({ error: error.message })
        });
}

exports.close_business_controler = async (req, res) => {
    const company_name = req.body.company_name
    const user_id = req.user.user_id
    const day_date = req.body.day_date

    pool.query("SELECT * FROM companies WHERE company_name = $1", [company_name])
        .then(company => {
            if (company.rows.length === 0) {
                res.status(401).json({ error: "the company was not registerd" });
            } else {
                pool.query("SELECT * FROM user_agencies WHERE company_id = $1 AND user_id = $2", [company.rows[0].company_id, user_id])
                    .then(agency => {
                        if (agency.rows.length === 0) {
                            res.status(401).json({ error: "the agency was not found" });
                        } else {
                            pool.query("SELECT * FROM transactions WHERE transaction_date = $1 AND agency_id = $2", [day_date, agency.rows[0].agency_id])
                                .then(transactions => {
                                    let total_deposit = 0;
                                    let total_withdraw = 0;
                                    transactions.rows.forEach(transaction => {
                                        if (transaction.transaction_type === "Withdraw") {
                                            total_withdraw += parseFloat(transaction.transaction_amont)
                                        }
                                        if (transaction.transaction_type === "Deposit") {
                                            total_deposit += parseFloat(transaction.transaction_amont)
                                        }
                                    });
                                    console.log(total_deposit);
                                    console.log(total_withdraw);

                                    let opening_float;
                                    pool.query("SELECT opening_float FROM float_balances WHERE agency_id = $1 AND daya_date = $2", [agency.rows[0].agency_id, day_date])
                                        .then(float => {
                                            opening_float = float.rows[0].opening_float
                                            closing_float = opening_float - total_deposit + total_withdraw;
                                            pool.query("UPDATE float_balances SET closing_float = $1  WHERE agency_id = $2 AND daya_date = $3", [closing_float, agency.rows[0].agency_id, day_date])
                                            res.status(200).json({
                                                message: `succesfully closed the businnes for ${day_date}`,
                                                data: {
                                                    closing_floatBalance: closing_float,
                                                }
                                            })
                                        })
                                        .catch(error => {
                                            res.status(500).json({ error: error.message })
                                        })

                                })
                        }
                    }
                    )
                    .catch(error => {
                        res.status(500).json({ error: error.message })
                    });
            }
        }).catch(error => {
            res.status(500).json({ error: error.message })
        });
};

exports.close_business_cash = async (req, res) => {
    const user_id = req.user.user_id
    const day_date = req.body.day_date
    let cash_data;
    let total_deposit=0;
    let total_withdraw=0;

   await pool.query("SELECT * FROM user_agencies WHERE  user_id = $1", [user_id])
    .then(async agencies => {
     const agencie_data = agencies.rows
     async function getBalances() {   
      for (const agency of agencie_data) {
       await pool.query("SELECT * FROM transactions WHERE transaction_date = $1 AND agency_id=$2 ", [day_date, agency.agency_id])
        .then(async transactions => {
        async function getTransact() {   
         for (const transaction of transactions.rows) {
                console.log(transaction);
                 if (transaction.transaction_type === "Withdraw") {
                    total_withdraw += parseFloat(transaction.transaction_amont);
                    
                   }
                   if (transaction.transaction_type === "Deposit") {
                       total_deposit += parseFloat(transaction.transaction_amont)                      
                   }
                   
            }
        const cash_data = {"cash_dep":total_deposit,
                            "cash_draw":total_withdraw, }
        // console.log(cash_data);
        return cash_data;
        } 
        cash_data =  await getTransact()  
              
        })
        .catch(error => {
            console.log(error);
        })
     }
    }
    await getBalances();
    }) 
    console.log(total_deposit);
    console.log(total_withdraw);
    pool.query("SELECT opening_cash FROM cash_balances WHERE user_id = $1 AND day_date = $2", [user_id, day_date])
        .then(cash => {
            opening_cash = cash.rows[0].opening_cash
            closing_cash = opening_cash - total_withdraw + total_deposit
            console.log(closing_cash);
            pool.query("UPDATE cash_balances SET closing_cash = $1  WHERE user_id = $2 AND day_date = $3", [closing_cash, user_id, day_date])
            res.status(200).json({
                message: `succesfully closed the businnes for ${day_date}`,
                data: {
                    closing_cashBalance: closing_cash
                }
            })
        }).catch(error => {
            res.status(500).json({ error: error.message })
        });
}