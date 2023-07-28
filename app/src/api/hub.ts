import * as SignalR from '@microsoft/signalr';
import { apiEndpoint } from 'helpers/constants';

var connection: SignalR.HubConnection | undefined;


let waitToken: any;

export async function connectWS(userId?: number) {
  var cn = new SignalR.HubConnectionBuilder()
  .withUrl(`${apiEndpoint}/ws/profile?user=${userId}`)
  .withAutomaticReconnect()
  .build();
  waitToken = new Promise(async resolve => {
    await cn!.start();
    // console.log('started', cn);
    resolve(true);
  });
  await waitToken;
  waitToken = undefined;
  connection = cn;
  // console.log('waited', connection);
  return cn;
}
export async function getConnectionWS() {
  if (waitToken) {
    await waitToken;
  }
  return connection;
}

export async function disconnectWS() {
  if (waitToken) {
    await waitToken;
  }
  // console.log('stopped', connection);
  await connection?.stop();
  connection = undefined;
  return true;
}
