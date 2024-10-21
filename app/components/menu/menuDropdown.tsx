import { Accordion, AccordionItem } from "@nextui-org/react";

interface Dish {
  name: string;
  description: string;
  price: number;
  image: string;
}

interface Menu {
  category: string;
  dishes: Dish[];
}

interface MenuProps {
  menuItems: Menu[];
}

const MenuDropdown: React.FC<MenuProps> = ({ menuItems }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-3xl mx-auto">
      {menuItems.map((menu, idx) => (
        <Accordion key={idx} className="w-full">
          <AccordionItem
            title={
              <h4 className="text-xl font-semibold text-gray-800">{menu.category}</h4>
            }
            className="p-4 bg-white shadow-md rounded-md mb-4"
          >
            {menu.dishes.map((dish, dishIdx) => (
              <div
                key={dishIdx}
                className="flex items-center gap-4 p-2 border-b border-gray-200 hover:bg-gray-50"
              >
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <h4 className="text-lg font-semibold">{dish.name}</h4>
                  <p className="text-sm text-gray-500">{dish.description}</p>
                </div>
                <div className="text-lg font-semibold text-gray-800">
                  ${dish.price}
                </div>
              </div>
            ))}
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
};

export default MenuDropdown;
