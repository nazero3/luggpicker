import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { connectToDatabase } from "../../../lib/db";
import {verifyPassword} from '../../../lib/auth';
export default NextAuth({
    session:{
        jwt: true,
    },
    providers: [
        Providers.Credentials({
            async authorize(credentials){
                const client = await connectToDatabase();

                const usersCollection = client.db().collection('users');
                const user = await usersCollection.findOne({email: credentials.email , password: credentials.password});

                if(!user) {
                    client.close();
                    throw new Error('No user found');
                }
                
                const isValid = await verifyPassword(credentials.password, user.password);
                
                 
                if(!isValid){
                    console.log(isValid + '1');
                    console.log(credentials);
                    console.log(user);
                    throw new Error('could not log you in');
                }
                client.close();
                return {email: user.email};
                
            }
        })
    ]
});