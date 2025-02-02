export const  createActivationToken = (): { activationCode: string } => {
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    return { activationCode };
  };
   