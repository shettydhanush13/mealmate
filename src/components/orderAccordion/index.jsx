import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import './styles.scss'

const OrderAccordion = ({ order }) => {
  const { people, orderDate, orderData, customerData } = order;
  const {
    orderName,
    price,
    special_request,
    menu_sections,
    date,
  } = orderData;
  const {
    totalPrice,
    totalDiscount,
    finalPrice,
    serviceCharge
  } = price;
  const { name, phone, address, area, pincode } = customerData;

  const getStatus = () => {
    const delivered = new Date(date) < new Date();
    if (delivered) {
      return 'Delivered'
    } else return 'In Progress'
  }

  return (
    <Accordion className="accordion-container">
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className="accordion-summary">
            <p>{orderName} for {people} People</p>
            <p>{date.split(',')[0]} - Order {getStatus()}</p>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          {/* Order Overview */}
          <Typography
            variant="subtitle1"
            className="section-title"
            gutterBottom
          >
            Order Overview
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="People" secondary={people} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Order Date" secondary={orderDate} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Event Time" secondary={date} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Special Request"
                secondary={special_request || "None"}
              />
            </ListItem>
          </List>
          <Divider />

          {/* Menu */}
          <Typography
            variant="subtitle1"
            className="section-title"
            gutterBottom
          >
            Menu Details
          </Typography>
          <List>
            {menu_sections.map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={item.split(':')[0]} secondary={item.split(':')[1]} />
              </ListItem>
            ))}
          </List>
          <Divider />

          {/* Price Details */}
          <Typography
            variant="subtitle1"
            className="section-title"
            gutterBottom
          >
            Price Details
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Total Price"
                secondary={totalPrice}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Service Charge"
                secondary={serviceCharge}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Total Discount"
                secondary={totalDiscount}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Final Price"
                secondary={finalPrice}
              />
            </ListItem>
          </List>
          <Divider />

          {/* Customer Information */}
          <Typography
            variant="subtitle1"
            className="section-title"
            gutterBottom
          >
            Customer Information
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Name" secondary={name} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Phone" secondary={phone} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Address" secondary={address} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Area" secondary={area} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Pincode" secondary={pincode} />
            </ListItem>
          </List>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default OrderAccordion;
