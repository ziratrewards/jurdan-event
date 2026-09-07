import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../Layout/header/header';
import { OrderCart } from '../../Components/order-cart/order-cart';
import { Ticket } from '../../Core/models/ticket.model';
import { SeatingMapService } from '../../Core/services/seating-map.service';
import { OrderCartService } from '../../Core/services/order-cart.service';
import { OrderItem } from '../../Core/models/order-item.model';

@Component({
  selector: 'app-chooes-chair',
  imports: [CommonModule, Header, OrderCart],
  templateUrl: './chooes-chair.html',
  styleUrl: './chooes-chair.css',
})
export class ChooesChair implements AfterViewInit {
  @ViewChild('mapImage')
  mapImage!: ElementRef<HTMLImageElement>;

  readonly minZoom = 0.5;
  readonly maxZoom = 2.5;
  readonly zoomStep = 0.25;
  readonly maxTicketsPerOrder = 10;

  zoomLevel = 1;

  selectedTicket: Ticket | null = null;
  selectedQuantity = 0;

  showOrderCart = false;

  tickets: Ticket[] = [
    {
      id: 'fan-pit',
      name: 'Fan Pit',
      price: 250,
      available: 50,
    },
    {
      id: 'golden-circle',
      name: 'Golden Circle',
      price: 200,
      available: 100,
    },
    {
      id: 'general-admission',
      name: 'General Admission',
      price: 90,
      available: 200,
    },
    {
      id: 'premium-left',
      name: 'Premium Left',
      block: 'Block 1',
      price: 150,
      available: 40,
    },
    {
      id: 'vip-left',
      name: 'VIP Left',
      block: 'Block 2',
      price: 180,
      available: 30,
    },
    {
      id: 'vip-theater',
      name: 'VIP Theater',
      block: 'Block 3',
      price: 200,
      available: 20,
    },
    {
      id: 'vip-right',
      name: 'VIP Right',
      block: 'Block 4',
      price: 180,
      available: 30,
    },
    {
      id: 'premium-right',
      name: 'Premium Right',
      block: 'Block 5',
      price: 150,
      available: 40,
    },
  ];

  constructor(
    private readonly seatingMapService: SeatingMapService,
    private readonly orderCartService: OrderCartService,
  ) { }

  ngAfterViewInit(): void {
    if (this.mapImage?.nativeElement?.naturalWidth > 0) {
      this.seatingMapService.initialize(this.mapImage.nativeElement);
    }
  }

  onImageLoad(): void {
    if (this.mapImage?.nativeElement) {
      this.seatingMapService.initialize(this.mapImage.nativeElement);
    }
  }

  onMapClick(event: MouseEvent): void {
    if (!this.mapImage?.nativeElement) {

      return;
    }

    const image = this.mapImage.nativeElement;
    const rect = image.getBoundingClientRect();

    const displayX = event.clientX - rect.left;
    const displayY = event.clientY - rect.top;

    const scaleX = image.naturalWidth / rect.width;

    const scaleY = image.naturalHeight / rect.height;

    const x = Math.floor(displayX * scaleX);
    const y = Math.floor(displayY * scaleY);

    const zone = this.seatingMapService.detectZone(x, y);

    if (!zone) {
      return;
    }

    this.selectTicket(zone);
  }

  selectTicket(id: string): void {
    const ticket = this.tickets.find((item) => item.id === id);

    if (!ticket) {

      return;
    }

    this.selectedTicket = ticket;
    this.selectedQuantity = 0;
  }

  increaseQuantity(): void {
    if (!this.selectedTicket) {
      return;
    }

    const maxQuantity = Math.min(this.maxTicketsPerOrder, this.selectedTicket.available);

    if (this.selectedQuantity < maxQuantity) {
      this.selectedQuantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.selectedQuantity > 0) {
      this.selectedQuantity--;
    }
  }

  addTicket(): void {
    if (!this.selectedTicket || this.selectedQuantity <= 0) {
      return;
    }

    this.orderCartService.addItem({
      id: this.selectedTicket.id,
      name: this.selectedTicket.name,
      block: this.selectedTicket.block,
      price: this.selectedTicket.price,
      quantity: this.selectedQuantity,
    });

    this.selectedTicket.available -= this.selectedQuantity;

    this.closeTicket();
  }

  closeTicket(): void {
    this.selectedTicket = null;
    this.selectedQuantity = 0;
  }

  get cartItems(): OrderItem[] {
    return this.orderCartService.getItems();
  }

  get selectedTicketsCount(): number {
    return this.orderCartService.getTotalTickets();
  }

  reviewOrder(): void {
    if (this.orderCartService.getItems().length === 0) {
      return;
    }

    this.showOrderCart = true;
  }

  closeOrderCart(): void {
    this.showOrderCart = false;
  }

  checkout(): void {
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + this.zoomStep, this.maxZoom);
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - this.zoomStep, this.minZoom);
  }

  onMapWheel(event: WheelEvent): void {
    event.preventDefault();

    if (event.deltaY < 0) {
      this.zoomIn();
      return;
    }

    this.zoomOut();
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      return;
    }

    document.exitFullscreen().catch(() => { });
  }

  goBack(): void {
    history.back();
  }
}
