//predicate function promise  always resolves object valid:true if keys exist in body; object valid:false if false with msg of what is missing
module.exports = function bodyCheck(bodyKeys, requiredKeys){
   return new Promise((res) => {
        let missing = [];
        for(let key of requiredKeys){
            if(!bodyKeys.includes(key)){
                missing.push(key);
            }
        }
        if(missing.length > 0){
            res({valid:false, message:(() => {
                let msg = "Bad Request body is missing ";
                for(let x of missing){
                    msg += `${x}/`
                }
                return msg.substring(0, msg.length - 1);
            })()});
        }else{
            res({valid:true});
        }
   })
    
}
