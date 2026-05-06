export const CanAccessVerificationType = (roleName, verificationType) => {
    const accessMap = {
        "Backend Team": "BACKEND",
        Agent: "PHYSICAL",
    };

    return accessMap[roleName] === verificationType;
};