//Name

const validateName = (name) => {
    return /^([a-zA-Z ]){2,30}$/.test(name);
  };
  
  // Email
  
  const validateEmail = (email) => {
    return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email);
  };
  
  //Password
  
  const validatePassword = (password) => {
    //8-12 characters, one lowercase letter and one number and maybe one UpperCase & special character:
    return /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,12}$/.test(password);
  };
   
  // const validatetitle = (title)=>{
  //   return /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d@$!%*?&]{1,70}$/.test(title);
  // }

  const fileValidation = (resume) =>{
    return /^.*\.(pdf|PDF)$/.test(resume)
  }

  const validateMobileNo = (Number) => {
    return /^[6789][0-9]{9}$/g.test(Number);
  };

  
  module.exports = {
    validateName,
    validateEmail,
    validatePassword,
    fileValidation,
   validateMobileNo
  };
  