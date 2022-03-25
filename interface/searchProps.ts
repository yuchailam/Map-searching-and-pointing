type SearchProps = {
  index: number; // able to change index order
  readonly searchDate: string | null; //
  readonly timeZone: string | null;
  readonly localTime: string | null;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly locality: string | null;
  readonly state: string | null;
  readonly country: string | null;
  readonly address: string | null; //formatted_address
  readonly fullAddress: string | null;
  readonly postcode: string | null;
};

//utc_offset_minutes
