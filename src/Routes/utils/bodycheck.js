//predicate function returns true if keys exist in body object if false with what is missing
module.exports = function bodyCheck(bodyKeys, requiredKeys){
    let missing = [];
    for(let key of requiredKeys){
        if(!bodyKeys.includes(key)){
            missing.push(key);
        }
    }
    if(missing.length > 0){
        return {valid:false, message:(() => {
            let msg = "Bad Request body is missing ";
            for(let x of missing){
                msg += `${x}/`
            }
            return msg.substring(0, msg.length - 1);
        })()};
    }else{
        return {valid:true};
    }
    
}
