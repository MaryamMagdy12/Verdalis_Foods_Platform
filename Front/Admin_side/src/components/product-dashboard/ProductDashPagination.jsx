import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { ScrollReveal } from "../shared/ScrollReveal";
import "../../assets/css/components/ProductDashPagination.css";

export function ProductDashPagination() {
  return (
    <ScrollReveal className="product-dash-pagination" once={false}>
      <div className="product-dash-pagination-left">
        <button type="button" className="product-dash-pagination-page">
          Filters <FontAwesomeIcon icon={faChevronDown} />
        </button>
        <div className="product-dash-pagination-pages">
          <button type="button" className="product-dash-pagination-page active">1</button>
          <button type="button" className="product-dash-pagination-page">2</button>
          <button type="button" className="product-dash-pagination-page">3</button>
        </div>
      </div>
      <div className="product-dash-pagination-right">
        <span>Name</span>
        <span>Category</span>
        <span>Edit</span>
        <span>&gt; Delete</span>
      </div>
    </ScrollReveal>
  );
}
