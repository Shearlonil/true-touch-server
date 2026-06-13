const preAuthorize = (...allowedAuthorities) => {
    return (req, res, next) => {
        if(!req?.whom?.roles) {
            return res.sendStatus(403); //  Forbidden
        }
        const result = allowedAuthorities.map(role => req.whom.roles.includes(role)).find(val => val === false);
        /*
            When result is undefined => user has all required roles
            When result has a certain value or explicitly shows false, then user doesn't have one or more roles  
        */
        if(result || result === false) {
            return res.sendStatus(403); // Forbidden
        }
        /*  Old method
        const rolesArr = [...allowedAuthorities];
        const result = req.whom.roles.map(role => rolesArr.includes(role)).find(val => val === true);
        if(!result) {
            return res.sendStatus(403); // Forbidden
        }
        */
        next();
    }
}

module.exports = preAuthorize;