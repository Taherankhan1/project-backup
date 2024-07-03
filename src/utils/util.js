const Util = class {

    static getBaseURL() {
        let baseURL = process.env.HOST
        if (Util.useProductionSettings() == false) {
            baseURL += ":" + process.env.PORT
        }
        return baseURL
    }

    static getErrorMessage(mongooseException) {
        try {
            const mainJSONKeys = Object.keys(mongooseException.errors);
            if (mongooseException.errors[mainJSONKeys[0]].errors) {
                const jsonKeys = Object.keys(mongooseException.errors[mainJSONKeys[0]].errors);
                return {
                    error: mongooseException.errors[mainJSONKeys[0]].errors[jsonKeys[0]].properties.message
                }
            } else {
                return {
                    error: mongooseException.errors[mainJSONKeys[0]].message
                }
            }
        } catch (e) {
            return {
                error: mongooseException.message
            }
        }
    }

    static useProductionSettings() {
        return Util.parseBoolean(process.env.isProduction)
    }

    static parseBoolean(b) {
        return (b + "").toLowerCase() == 'true'
    }

    static generateRandomPassword(length) {
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const digitChars = '0123456789';
        const specialChars = '@$!%*?&';
        
        const allChars = uppercaseChars + lowercaseChars + digitChars + specialChars;
        const allCharsLength = allChars.length;
    
        let password = '';
       
        // Ensure at least one character from each character type
        password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
        password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
        password += digitChars.charAt(Math.floor(Math.random() * digitChars.length));
        password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
        // Fill the rest of the password
        for (let i = 4; i < length; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allCharsLength));
        }
    
        // Shuffle the password to ensure randomness
        password = password.split('').sort(() => Math.random() - 0.5).join('');
    
        return password;
    }

    static getSystemDateTimeUTC = () => {
        return new Date(new Date().toUTCString());
    };

    static addYearsToDate (date, years) {
        return new Date(date.getFullYear() + years, date.getMonth(), date.getDate());
    };

    static getErrorMessageFromString(message) {
        return {
            error: message
        };
    };
    
    static GenerateRandomSerialno = (length) => {
        var result = "";
        // var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var characters = "0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

}
module.exports = Util