-- Prevent payment replay by enforcing unique payment references.
alter table public.orders
  add constraint orders_reference_unique unique (reference);
