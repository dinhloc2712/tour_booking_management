export const rolesPermissions = {
    admin: [
      'view tour',
      'create tour',
      'edit tour',
      'delete tour',
      'view branch',
      'create branch',
      'edit branch',
      'delete branch',
      'view customer',
      'edit customer',
      'payment',
      'refund',
      'view booking',
      'create booking',
      'edit booking',
      'view statistical',
      'chat',
      'add booking'
    ],
    sale: [
      'view tour',
      'view branch',
      'view customer',
      'create booking',
      'edit booking',
      'chat',
    ],
    receptionist: [
      'view tour',
      'view branch',
      'view customer',
      'create booking',
      'edit booking',
      'payment',
      'refund',
      'chat',
    ],
    guide: [
      'view booking',
      'edit booking',
    ],
    accountant: [
      'view statistical',
      'view revenue',
      'view booking',
    ],
  };
  