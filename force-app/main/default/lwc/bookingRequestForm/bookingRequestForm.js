import { LightningElement, track } from 'lwc';
import createBooking from '@salesforce/apex/BookingRequestController.createBooking';
import getAvailablePlots from '@salesforce/apex/BookingRequestController.getAvailablePlots';

export default class BookingRequestForm extends LightningElement {
  @track name = '';
  @track desiredDate = '';
  @track comments = '';
  @track plotOptions = [];
  @track selectedPlot = '';
  @track successMessage = '';
  @track errorMessage = '';

  connectedCallback() {
    getAvailablePlots()
      .then(result => {
        this.plotOptions = result.map(p => ({ label: p.Name, value: p.Id }));
      })
      .catch(err => {
        this.errorMessage = 'Unable to load plots';
      });
  }

  handleChange(e) {
    const id = e.target.dataset.id;
    if(id === 'name') this.name = e.target.value;
    if(id === 'date') this.desiredDate = e.target.value;
    if(id === 'comments') this.comments = e.target.value;
  }

  handlePlotChange(e) {
    this.selectedPlot = e.target.value;
  }

  submit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.name || !this.desiredDate || !this.selectedPlot) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    const payload = {
      Name: this.name,
      Desired_Burial_Date: this.desiredDate,
      Requested_PlotId: this.selectedPlot,
      Comments: this.comments
    };

    createBooking({ payload })
      .then(id => {
        this.successMessage = 'Booking request submitted — reference: ' + id;
        this.name = '';
        this.desiredDate = '';
        this.selectedPlot = '';
        this.comments = '';
      })
      .catch(err => {
        this.errorMessage = err.body ? err.body.message : 'Unexpected error';
      });
  }
}
