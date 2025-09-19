export interface SuggestedAction {
  id: string
  description: string
  action?: string
  actionLink?: string
}

export interface RelatedDocument {
  id: string
  filename: string
  url?: string
  type?: string
}

export const sampleAutocompleteData = {
  suggestedActions: [
    {
      id: "RFX 1234",
      description: "Evaluate Commercials",
      action: "evaluate_commercials",
      actionLink: "10083-WELDING EQUIPMENT & ACCESSORIES | Raunak Arora"
    },
    {
      id: "RFX 1234",
      description: "Extend time in RFP",
      action: "extend_rfp_time",
      actionLink: "10083-WELDING EQUIPMENT & ACCESSORIES | Raunak Arora"
    },
    {
      id: "RFX 1234",
      description: "Extend time in RFQ",
      action: "extend_rfq_time",
      actionLink: "10083-WELDING EQUIPMENT & ACCESSORIES | Raunak Arora"
    },
    {
      id: "RFX 1234",
      description: "Convert RFQ to Auction",
      action: "convert_rfq_to_auction",
      actionLink: "10083-WELDING EQUIPMENT & ACCESSORIES | Raunak Arora"
    },
    {
      id: "RFX 1234",
      description: "Convert RFQ to Auction",
      action: "convert_rfq_to_auction_2",
      actionLink: "10083-WELDING EQUIPMENT & ACCESSORIES | Raunak Arora"
    },
    {
      id: "RFX 1234",
      description: "Convert RFQ to Auction",
      action: "convert_rfq_to_auction_3",
      actionLink: "10083-WELDING EQUIPMENT & ACCESSORIES | Raunak Arora"
    },
    {
      id: "RFX 1234",
      description: "Convert RFQ to Auction",
      action: "convert_rfq_to_auction_4",
      actionLink: "10083-WELDING EQUIPMENT & ACCESSORIES | Raunak Arora"
    }
  ],
  relatedDocuments: [
    {
      id: "RFX 1234",
      filename: "Invoice_RFX_1234.pdf",
      url: "/documents/Invoice_RFX_1234.pdf",
      type: "pdf"
    },
    {
      id: "RFX 1234",
      filename: "Terms&Conditions_RFX_1234.pdf",
      url: "/documents/Terms&Conditions_RFX_1234.pdf",
      type: "pdf"
    },
    {
      id: "RFX 1234",
      filename: "POO.xlsx",
      url: "/documents/POO.xlsx",
      type: "excel"
    }
  ]
}

export const getAutocompleteData = (query: string) => {
  // This function can be expanded to filter data based on search query
  // For now, returning the sample data
  return sampleAutocompleteData
}
