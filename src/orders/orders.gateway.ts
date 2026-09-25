import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * WebSocket gateway for real-time order updates.
 */
@WebSocketGateway({ namespace: 'orders' })
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  /**
   * Subscribe to order status updates for a given order ID.
   */
  @SubscribeMessage('subscribeOrder')
  handleSubscribe(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: Socket,
  ): { status: string; orderId: string } {
    client.join(`order:${orderId}`);
    return { status: 'subscribed', orderId };
  }
}
