export const CanAccessVerificationType = (roleName, verificationType) => {
    console.log({ roleName, verificationType }, "checking access for verification type");
    
    const accessMap = {
        "Backend Team": "BACKEND",
        "Agent": "PHYSICAL",
    };

    return accessMap[roleName] === verificationType;
};