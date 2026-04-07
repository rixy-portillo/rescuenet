import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create shelters
  const shelter1 = await prisma.shelter.create({
    data: {
      name: "Austin Animal Center",
      description:
        "Austin's largest open-intake animal shelter, serving the community since 2011.",
      phone: "512-978-0500",
      email: "animal.services@austintexas.gov",
      website: "https://www.austintexas.gov/austin-animal-center",
      addressLine1: "7201 Levander Loop",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
    },
  });

  const shelter2 = await prisma.shelter.create({
    data: {
      name: "LA County Animal Care",
      description:
        "Serving the animals and residents of Los Angeles County.",
      phone: "562-256-7583",
      email: "info@animalcare.lacounty.gov",
      city: "Downey",
      state: "CA",
      zipCode: "90242",
    },
  });

  const shelter3 = await prisma.shelter.create({
    data: {
      name: "Miami-Dade Animal Services",
      description: "Providing shelter and care for Miami-Dade's animals.",
      phone: "305-884-1101",
      city: "Doral",
      state: "FL",
      zipCode: "33178",
    },
  });

  // Create animals
  const animals = await Promise.all([
    prisma.animal.create({
      data: {
        shelterId: shelter1.id,
        name: "Buddy",
        externalId: "A892451",
        species: "DOG",
        breed: "Labrador Retriever",
        ageYears: 3,
        gender: "MALE",
        size: "LARGE",
        weightLbs: 65,
        color: "Yellow",
        description:
          "Buddy is a sweet, energetic Lab who loves fetch and belly rubs. Great with kids and other dogs.",
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: false,
        houseTrained: true,
        spayedNeutered: true,
        vaccinated: true,
      },
    }),
    prisma.animal.create({
      data: {
        shelterId: shelter1.id,
        name: "Whiskers",
        externalId: "A892503",
        species: "CAT",
        breed: "Domestic Shorthair",
        ageYears: 5,
        gender: "FEMALE",
        size: "MEDIUM",
        weightLbs: 10,
        color: "Tabby",
        description:
          "Whiskers is a calm, affectionate cat who loves window spots and gentle petting.",
        goodWithKids: true,
        goodWithDogs: false,
        goodWithCats: true,
        houseTrained: true,
        spayedNeutered: true,
        vaccinated: true,
      },
    }),
    prisma.animal.create({
      data: {
        shelterId: shelter2.id,
        externalId: "LA-2024-1187",
        species: "DOG",
        breed: "Pit Bull Terrier",
        breedSecondary: "Boxer",
        ageYears: 2,
        gender: "MALE",
        size: "LARGE",
        weightLbs: 55,
        color: "Brindle",
        description:
          "A strong, loyal boy who needs an experienced handler. Loves people but selective with other dogs.",
        goodWithKids: true,
        goodWithDogs: false,
        houseTrained: true,
        spayedNeutered: true,
        vaccinated: true,
        behavioralNotes: "Leash reactive with unknown dogs. Does well in structured environments.",
      },
    }),
    prisma.animal.create({
      data: {
        shelterId: shelter2.id,
        name: "Luna",
        species: "CAT",
        breed: "Siamese Mix",
        ageYears: 1,
        ageMonths: 6,
        gender: "FEMALE",
        size: "SMALL",
        weightLbs: 7,
        color: "Seal Point",
        description:
          "Luna is a playful young cat with striking blue eyes. Very social and vocal.",
        goodWithKids: true,
        goodWithCats: true,
        spayedNeutered: true,
        vaccinated: true,
      },
    }),
    prisma.animal.create({
      data: {
        shelterId: shelter3.id,
        name: "Max",
        externalId: "MD-88921",
        species: "DOG",
        breed: "German Shepherd",
        ageYears: 7,
        gender: "MALE",
        size: "LARGE",
        weightLbs: 80,
        color: "Black and Tan",
        description:
          "Senior gentleman who is calm, well-mannered, and great on leash. Loves car rides.",
        medicalNotes: "Mild arthritis, on joint supplement.",
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: true,
        houseTrained: true,
        spayedNeutered: true,
        vaccinated: true,
        specialNeeds: "Needs joint supplements and a soft bed.",
      },
    }),
  ]);

  // Create listings with varying urgency
  const now = new Date();
  const daysFromNow = (days: number) =>
    new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  await Promise.all([
    // LAST_CALL — Buddy has 1 day
    prisma.listing.create({
      data: {
        animalId: animals[0].id,
        status: "ACTIVE",
        urgency: "LAST_CALL",
        deadlineAt: daysFromNow(1),
        riskReason: "TIME_LIMIT",
        notes: "Hold period expires tomorrow. Needs rescue or foster ASAP.",
        sourceUrl: "https://www.austintexas.gov/austin-animal-center",
        verificationStatus: "VERIFIED",
        verifiedAt: now,
        publishedAt: now,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "ACTIVE",
          },
        },
      },
    }),
    // HIGH — Whiskers has 3 days
    prisma.listing.create({
      data: {
        animalId: animals[1].id,
        status: "ACTIVE",
        urgency: "HIGH",
        deadlineAt: daysFromNow(3),
        riskReason: "SPACE",
        notes: "Shelter at capacity. Cat wing is full.",
        verificationStatus: "VERIFIED",
        verifiedAt: now,
        publishedAt: now,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "ACTIVE",
          },
        },
      },
    }),
    // HIGH — unnamed pit bull, no exact deadline
    prisma.listing.create({
      data: {
        animalId: animals[2].id,
        status: "ACTIVE",
        urgency: "HIGH",
        deadlineAt: null,
        riskReason: "BEHAVIORAL",
        notes: "Needs experienced handler. Shelter cannot provide long-term behavioral support.",
        sourceUrl: "https://animalcare.lacounty.gov",
        verificationStatus: "PARTNER_SHELTER",
        verifiedAt: now,
        publishedAt: now,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "ACTIVE",
          },
        },
      },
    }),
    // MED — Luna has 10 days
    prisma.listing.create({
      data: {
        animalId: animals[3].id,
        status: "ACTIVE",
        urgency: "MED",
        deadlineAt: daysFromNow(10),
        riskReason: "SPACE",
        publishedAt: now,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "ACTIVE",
          },
        },
      },
    }),
    // LAST_CALL — Max, senior dog, 12 hours
    prisma.listing.create({
      data: {
        animalId: animals[4].id,
        status: "ACTIVE",
        urgency: "LAST_CALL",
        deadlineAt: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        riskReason: "TIME_LIMIT",
        notes: "Senior dog, hold period expired. On tomorrow's euthanasia list.",
        sourceNotes: "Confirmed by shelter staff via phone call.",
        verificationStatus: "VERIFIED",
        verifiedAt: now,
        publishedAt: now,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "ACTIVE",
          },
        },
      },
    }),
  ]);

  console.log("Seed complete!");
  console.log(`  ${3} shelters created`);
  console.log(`  ${animals.length} animals created`);
  console.log(`  ${5} listings created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
