import MenuDropdown from './menuDropdown'; // Adjust the path as needed

const menuData = [
    {
      category: 'Appetizers',
      dishes: [
        { name: 'Spring Rolls', description: 'Crispy rolls filled with vegetables and chicken.' },
        { name: 'Bruschetta', description: 'Grilled bread topped with fresh tomatoes and basil.' }
      ]
    },
    {
      category: 'Main Course',
      dishes: [
        { name: 'Grilled Salmon', description: 'Salmon fillet served with a lemon butter sauce.' },
        { name: 'Steak', description: 'Juicy grilled steak with a side of roasted potatoes.' }
      ]
    },
    {
      category: 'Desserts',
      dishes: [
        { name: 'Cheesecake', description: 'Creamy cheesecake with a graham cracker crust.' },
        { name: 'Chocolate Mousse', description: 'Rich chocolate mousse with whipped cream.' }
      ]
    }
  ];

const Menu = (menuData: any) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Menu</h1>
      <MenuDropdown menuItems={menuData} />
    </div>
  );
};

export default Menu;
